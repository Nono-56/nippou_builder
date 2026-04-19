import type { PagesFunction } from '@cloudflare/workers-types';
import {
  badRequest,
  createUser,
  listUsers,
  parseBody,
  serverError,
  validateUsername,
  type Env,
} from '../../_lib/task-store';

type CreateUserPayload = {
  username?: unknown;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const users = await listUsers(context.env);
    return Response.json({ users });
  } catch (error) {
    console.error('list users failed', error);
    return serverError('ユーザー一覧の取得に失敗しました。');
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await parseBody<CreateUserPayload>(context.request);
  const username = validateUsername(body?.username);

  if (!username) {
    return badRequest('ユーザー名は英数字・ハイフン・アンダースコアで3〜32文字にしてください。');
  }

  try {
    const user = await createUser(context.env, username);
    if (!user) {
      return badRequest('そのユーザー名は既に使用されています。');
    }
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error('create user failed', error);
    return serverError('ユーザー作成に失敗しました。');
  }
};
