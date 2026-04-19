import type { SyncTasksResponse, TaskInput } from './types';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : '同期 API の呼び出しに失敗しました。';
    throw new Error(message);
  }

  return payload as T;
}

export function connectSync(syncCode: string): Promise<SyncTasksResponse> {
  return request<SyncTasksResponse>('/api/sync/connect', {
    method: 'POST',
    body: { syncCode },
  });
}

export function fetchTasks(syncCode: string): Promise<SyncTasksResponse> {
  const params = new URLSearchParams({ syncCode });
  return request<SyncTasksResponse>(`/api/tasks?${params.toString()}`);
}

export function createTask(syncCode: string, task: TaskInput): Promise<SyncTasksResponse> {
  return request<SyncTasksResponse>('/api/tasks', {
    method: 'POST',
    body: { syncCode, task },
  });
}

export function removeTask(syncCode: string, taskId: string): Promise<SyncTasksResponse> {
  const params = new URLSearchParams({ syncCode });
  return request<SyncTasksResponse>(`/api/tasks/${encodeURIComponent(taskId)}?${params.toString()}`, {
    method: 'DELETE',
  });
}

// --- Username-based API ---

export function fetchTasksByUsername(username: string): Promise<SyncTasksResponse> {
  return request<SyncTasksResponse>(`/api/u/${encodeURIComponent(username)}/tasks`);
}

export function createTaskByUsername(username: string, task: TaskInput): Promise<SyncTasksResponse> {
  return request<SyncTasksResponse>(`/api/u/${encodeURIComponent(username)}/tasks`, {
    method: 'POST',
    body: { task },
  });
}

export function removeTaskByUsername(username: string, taskId: string): Promise<SyncTasksResponse> {
  return request<SyncTasksResponse>(`/api/u/${encodeURIComponent(username)}/tasks/${encodeURIComponent(taskId)}`, {
    method: 'DELETE',
  });
}

// --- User management API ---

export type UserRecord = {
  id: string;
  username: string;
  createdAt: string;
};

export function fetchUsers(): Promise<{ users: UserRecord[] }> {
  return request<{ users: UserRecord[] }>('/api/users');
}

export function createUser(username: string): Promise<{ user: UserRecord }> {
  return request<{ user: UserRecord }>('/api/users', {
    method: 'POST',
    body: { username },
  });
}

export function deleteUser(username: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/users/${encodeURIComponent(username)}`, {
    method: 'DELETE',
  });
}
