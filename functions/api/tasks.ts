import type { PagesFunction } from '@cloudflare/workers-types';
import {
  badRequest,
  fetchSpaceTasks,
  insertTask,
  parseBody,
  serverError,
  validateSyncCode,
  validateTask,
  type Env,
} from '../_lib/task-store';

type TaskPayload = {
  syncCode?: unknown;
  task?: unknown;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const syncCode = validateSyncCode(new URL(context.request.url).searchParams.get('syncCode'));

  if (!syncCode) {
    return badRequest('共有コードが不正です。');
  }

  try {
    const data = await fetchSpaceTasks(context.env, syncCode);
    return Response.json(data ?? { tasks: [], lastSyncedAt: null });
  } catch (error) {
    console.error('fetch tasks failed', error);
    return serverError('タスク取得に失敗しました。');
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await parseBody<TaskPayload>(context.request);
  const syncCode = validateSyncCode(body?.syncCode);
  const task = validateTask(body?.task);

  if (!syncCode) {
    return badRequest('共有コードが不正です。');
  }

  if (!task) {
    return badRequest('タスクの入力値が不正です。');
  }

  try {
    return Response.json(await insertTask(context.env, syncCode, task));
  } catch (error) {
    console.error('create task failed', error);
    return serverError('タスク保存に失敗しました。');
  }
};
