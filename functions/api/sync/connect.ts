import type { PagesFunction } from '@cloudflare/workers-types';
import {
  badRequest,
  connectSpace,
  parseBody,
  serverError,
  validateSyncCode,
  type Env,
} from '../../_lib/task-store';

type ConnectPayload = {
  syncCode?: unknown;
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await parseBody<ConnectPayload>(context.request);
  const syncCode = validateSyncCode(body?.syncCode);

  if (!syncCode) {
    return badRequest('共有コードは 3 文字以上 64 文字以下で入力してください。');
  }

  try {
    return Response.json(await connectSpace(context.env, syncCode));
  } catch (error) {
    console.error('connect sync failed', error);
    return serverError('同期接続に失敗しました。');
  }
};
