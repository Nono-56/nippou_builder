import type { PagesFunction } from '@cloudflare/workers-types';
import {
  badRequest,
  deleteTaskByUsername,
  notFound,
  serverError,
  validateUsername,
  type Env,
} from '../../../../_lib/task-store';

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const username = validateUsername(context.params.username);
  const taskId = typeof context.params.id === 'string' ? context.params.id.trim() : '';

  if (!username) return badRequest('ユーザー名が不正です。');
  if (!taskId) return badRequest('削除対象のタスク ID が不正です。');

  try {
    const data = await deleteTaskByUsername(context.env, username, taskId);
    if (!data) return notFound('ユーザーまたはタスクが見つかりません。');
    return Response.json(data);
  } catch (error) {
    console.error('delete task by username failed', error);
    return serverError('タスク削除に失敗しました。');
  }
};
