# API 仕様

API は FastAPI として `backend/` に実装されています。レスポンスの時刻は ISO 8601 文字列です。

## Health

### GET `/health`

```json
{ "status": "ok" }
```

## ユーザー管理 API

### GET `/api/users`

```json
{ "users": [{ "id": "uuid", "username": "alice", "createdAt": "2026-05-09T00:00:00.000Z" }] }
```

### POST `/api/users`

```json
{ "username": "alice" }
```

ユーザー名は英数字・ハイフン・アンダースコアで 3〜32 文字です。

### DELETE `/api/users/{username}`

```json
{ "success": true }
```

ユーザーを削除すると、そのユーザーのタスクも削除されます。

## ユーザー別タスク API

### GET `/api/u/{username}/tasks`

```json
{
  "tasks": [
    {
      "id": "uuid",
      "date": "2026-05-09",
      "startTime": "09:00",
      "endTime": "10:30",
      "content": "実装"
    }
  ],
  "lastSyncedAt": "2026-05-09T00:00:00.000Z"
}
```

### POST `/api/u/{username}/tasks`

```json
{
  "task": {
    "id": "uuid",
    "date": "2026-05-09",
    "startTime": "09:00",
    "endTime": "10:30",
    "content": "実装"
  }
}
```

### DELETE `/api/u/{username}/tasks/{task_id}`

```json
{
  "tasks": [],
  "lastSyncedAt": "2026-05-09T00:00:00.000Z"
}
```

## エラーレスポンス

```json
{ "error": "エラーメッセージ" }
```
