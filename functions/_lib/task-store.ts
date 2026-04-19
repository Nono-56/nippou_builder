import type { D1Database } from '@cloudflare/workers-types';

export type TaskRecord = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  content: string;
};

export type SyncTasksResponse = {
  tasks: TaskRecord[];
  lastSyncedAt: string | null;
};

export type UserRecord = {
  id: string;
  username: string;
  createdAt: string;
};

export interface Env {
  DB: D1Database;
}

type TaskRow = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  content: string;
};

type SpaceRow = {
  id: string;
  updated_at: string;
};

type UserRow = {
  id: string;
  username: string;
  created_at: string;
};

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function badRequest(message: string): Response {
  return json({ error: message }, 400);
}

export function notFound(message: string): Response {
  return json({ error: message }, 404);
}

export function serverError(message: string): Response {
  return json({ error: message }, 500);
}

export async function parseBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

function normalizeSyncCode(syncCode: string): string {
  return syncCode.trim();
}

async function hashSyncCode(syncCode: string): Promise<string> {
  const normalized = normalizeSyncCode(syncCode);
  const buffer = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function validateSyncCode(syncCode: unknown): string | null {
  if (typeof syncCode !== 'string') return null;
  const normalized = normalizeSyncCode(syncCode);
  if (normalized.length < 3 || normalized.length > 64) return null;
  return normalized;
}

export function validateUsername(username: unknown): string | null {
  if (typeof username !== 'string') return null;
  const normalized = username.trim().toLowerCase();
  // alphanumeric + hyphen/underscore, 3-32 chars
  if (!/^[a-z0-9_-]{3,32}$/.test(normalized)) return null;
  return normalized;
}

export function validateTask(task: unknown): TaskRecord | null {
  if (!task || typeof task !== 'object') return null;

  const candidate = task as Record<string, unknown>;
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.date !== 'string' ||
    typeof candidate.startTime !== 'string' ||
    typeof candidate.endTime !== 'string' ||
    typeof candidate.content !== 'string'
  ) {
    return null;
  }

  const cleanTask: TaskRecord = {
    id: candidate.id.trim(),
    date: candidate.date.trim(),
    startTime: candidate.startTime.trim(),
    endTime: candidate.endTime.trim(),
    content: candidate.content.trim(),
  };

  if (!cleanTask.id || !cleanTask.date || !cleanTask.startTime || !cleanTask.endTime || !cleanTask.content) {
    return null;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const timePattern = /^\d{2}:\d{2}$/;

  if (!datePattern.test(cleanTask.date) || !timePattern.test(cleanTask.startTime) || !timePattern.test(cleanTask.endTime)) {
    return null;
  }

  return cleanTask;
}

export async function getOrCreateSpace(env: Env, syncCode: string): Promise<SpaceRow> {
  const codeHash = await hashSyncCode(syncCode);
  const existing = await env.DB.prepare('SELECT id, updated_at FROM sync_spaces WHERE code_hash = ?')
    .bind(codeHash)
    .first<SpaceRow>();

  if (existing) return existing;

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await env.DB.prepare(
    'INSERT INTO sync_spaces (id, code_hash, created_at, updated_at) VALUES (?, ?, ?, ?)',
  )
    .bind(id, codeHash, now, now)
    .run();

  return { id, updated_at: now };
}

export async function requireSpace(env: Env, syncCode: string): Promise<SpaceRow | null> {
  const codeHash = await hashSyncCode(syncCode);
  return env.DB.prepare('SELECT id, updated_at FROM sync_spaces WHERE code_hash = ?')
    .bind(codeHash)
    .first<SpaceRow>();
}

async function requireSpaceByUsername(env: Env, username: string): Promise<SpaceRow | null> {
  return env.DB.prepare('SELECT id, updated_at FROM sync_spaces WHERE username = ?')
    .bind(username)
    .first<SpaceRow>();
}

export async function listTasks(env: Env, spaceId: string): Promise<TaskRecord[]> {
  const result = await env.DB.prepare(
    `SELECT id, date, start_time, end_time, content
     FROM tasks
     WHERE space_id = ?
     ORDER BY date ASC, start_time ASC, created_at ASC`,
  )
    .bind(spaceId)
    .all<TaskRow>();

  return (result.results ?? []).map((row) => ({
    id: row.id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    content: row.content,
  }));
}

async function touchSpace(env: Env, spaceId: string): Promise<string> {
  const now = new Date().toISOString();
  await env.DB.prepare('UPDATE sync_spaces SET updated_at = ? WHERE id = ?').bind(now, spaceId).run();
  return now;
}

export async function buildSyncResponse(env: Env, spaceId: string, lastSyncedAt?: string | null): Promise<SyncTasksResponse> {
  const tasks = await listTasks(env, spaceId);
  return {
    tasks,
    lastSyncedAt: lastSyncedAt ?? null,
  };
}

export async function connectSpace(env: Env, syncCode: string): Promise<SyncTasksResponse> {
  const space = await getOrCreateSpace(env, syncCode);
  return buildSyncResponse(env, space.id, space.updated_at);
}

export async function fetchSpaceTasks(env: Env, syncCode: string): Promise<SyncTasksResponse | null> {
  const space = await requireSpace(env, syncCode);
  if (!space) return null;
  return buildSyncResponse(env, space.id, space.updated_at);
}

export async function fetchSpaceTasksByUsername(env: Env, username: string): Promise<SyncTasksResponse | null> {
  const space = await requireSpaceByUsername(env, username);
  if (!space) return null;
  return buildSyncResponse(env, space.id, space.updated_at);
}

export async function insertTask(env: Env, syncCode: string, task: TaskRecord): Promise<SyncTasksResponse> {
  const space = await getOrCreateSpace(env, syncCode);
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO tasks (id, space_id, date, start_time, end_time, content, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(task.id, space.id, task.date, task.startTime, task.endTime, task.content, now, now)
    .run();

  const lastSyncedAt = await touchSpace(env, space.id);
  return buildSyncResponse(env, space.id, lastSyncedAt);
}

export async function insertTaskByUsername(env: Env, username: string, task: TaskRecord): Promise<SyncTasksResponse | null> {
  const space = await requireSpaceByUsername(env, username);
  if (!space) return null;
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO tasks (id, space_id, date, start_time, end_time, content, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(task.id, space.id, task.date, task.startTime, task.endTime, task.content, now, now)
    .run();

  const lastSyncedAt = await touchSpace(env, space.id);
  return buildSyncResponse(env, space.id, lastSyncedAt);
}

export async function deleteTask(env: Env, syncCode: string, taskId: string): Promise<SyncTasksResponse | null> {
  const space = await requireSpace(env, syncCode);
  if (!space) return null;

  await env.DB.prepare('DELETE FROM tasks WHERE id = ? AND space_id = ?').bind(taskId, space.id).run();
  const lastSyncedAt = await touchSpace(env, space.id);
  return buildSyncResponse(env, space.id, lastSyncedAt);
}

export async function deleteTaskByUsername(env: Env, username: string, taskId: string): Promise<SyncTasksResponse | null> {
  const space = await requireSpaceByUsername(env, username);
  if (!space) return null;

  await env.DB.prepare('DELETE FROM tasks WHERE id = ? AND space_id = ?').bind(taskId, space.id).run();
  const lastSyncedAt = await touchSpace(env, space.id);
  return buildSyncResponse(env, space.id, lastSyncedAt);
}

// --- User management ---

export async function listUsers(env: Env): Promise<UserRecord[]> {
  const result = await env.DB.prepare(
    'SELECT id, username, created_at FROM sync_spaces WHERE username IS NOT NULL ORDER BY created_at ASC',
  ).all<UserRow>();

  return (result.results ?? []).map((row) => ({
    id: row.id,
    username: row.username,
    createdAt: row.created_at,
  }));
}

export async function createUser(env: Env, username: string): Promise<UserRecord | null> {
  const existing = await env.DB.prepare('SELECT id FROM sync_spaces WHERE username = ?')
    .bind(username)
    .first<{ id: string }>();

  if (existing) return null;

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const codeHash = await hashSyncCode(username);

  await env.DB.prepare(
    'INSERT INTO sync_spaces (id, code_hash, username, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(id, codeHash, username, now, now)
    .run();

  return { id, username, createdAt: now };
}

export async function deleteUser(env: Env, username: string): Promise<boolean> {
  const result = await env.DB.prepare('DELETE FROM sync_spaces WHERE username = ?')
    .bind(username)
    .run();

  return (result.meta?.changes ?? 0) > 0;
}

export { json };
