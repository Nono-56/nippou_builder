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
