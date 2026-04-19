import type { PagesFunction } from '@cloudflare/workers-types';
import {
  badRequest,
  deleteUser,
  notFound,
  serverError,
  validateUsername,
  type Env,
} from '../../_lib/task-store';

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const username = validateUsername(context.params.username);

  if (!username) {
    return badRequest('ユーザー名が不正です。');
  }

  try {
    const deleted = await deleteUser(context.env, username);
    if (!deleted) {
      return notFound('ユーザーが見つかりません。');
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error('delete user failed', error);
    return serverError('ユーザー削除に失敗しました。');
  }
};
