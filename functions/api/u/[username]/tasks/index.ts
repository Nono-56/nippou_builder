import type { PagesFunction } from '@cloudflare/workers-types';
import {
  badRequest,
  fetchSpaceTasksByUsername,
  insertTaskByUsername,
  notFound,
  parseBody,
  serverError,
  validateTask,
  validateUsername,
  type Env,
} from '../../../../_lib/task-store';

type TaskPayload = {
  task?: unknown;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const username = validateUsername(context.params.username);
  if (!username) return badRequest('ユーザー名が不正です。');

  try {
    const data = await fetchSpaceTasksByUsername(context.env, username);
    if (!data) return notFound('ユーザーが見つかりません。');
    return Response.json(data);
  } catch (error) {
    console.error('fetch tasks by username failed', error);
    return serverError('タスク取得に失敗しました。');
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const username = validateUsername(context.params.username);
  if (!username) return badRequest('ユーザー名が不正です。');

  const body = await parseBody<TaskPayload>(context.request);
  const task = validateTask(body?.task);
  if (!task) return badRequest('タスクの入力値が不正です。');

  try {
    const data = await insertTaskByUsername(context.env, username, task);
    if (!data) return notFound('ユーザーが見つかりません。');
    return Response.json(data);
  } catch (error) {
    console.error('create task by username failed', error);
    return serverError('タスク保存に失敗しました。');
  }
};
