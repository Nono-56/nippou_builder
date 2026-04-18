import type { PagesFunction } from '@cloudflare/workers-types';
import {
  badRequest,
  deleteTask,
  serverError,
  validateSyncCode,
  type Env,
} from '../../_lib/task-store';

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const syncCode = validateSyncCode(new URL(context.request.url).searchParams.get('syncCode'));
  const taskId = typeof context.params.id === 'string' ? context.params.id.trim() : '';

  if (!syncCode) {
    return badRequest('共有コードが不正です。');
  }

  if (!taskId) {
    return badRequest('削除対象のタスク ID が不正です。');
  }

  try {
    const data = await deleteTask(context.env, syncCode, taskId);
    return Response.json(data ?? { tasks: [], lastSyncedAt: null });
  } catch (error) {
    console.error('delete task failed', error);
    return serverError('タスク削除に失敗しました。');
  }
};
