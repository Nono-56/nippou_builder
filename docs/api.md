# API仕様

すべてのエンドポイントは Cloudflare Pages Functions として `functions/api/` に実装されています。

## エンドポイント一覧

### POST `/api/sync/connect`

同期接続の確立。共有コードに対応する sync_space を作成または取得し、全タスクを返す。

**リクエストボディ**
```json
{ "syncCode": "任意の共有コード文字列" }
```

**レスポンス**
```json
{
  "tasks": [/* Task[] */],
  "lastSyncedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### GET `/api/tasks`

指定した共有コードに紐づく全タスクを取得する。

**クエリパラメーター**
| パラメーター | 型 | 必須 | 説明 |
|------------|-----|------|------|
| `syncCode` | string | ✓ | 共有コード |

**レスポンス**
```json
{
  "tasks": [/* Task[] */],
  "lastSyncedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### POST `/api/tasks`

タスクを作成する。

**リクエストボディ**
```json
{
  "syncCode": "共有コード",
  "task": {
    "date": "2024-01-15",
    "startTime": "09:00",
    "endTime": "10:30",
    "content": "MTGに参加"
  }
}
```

**レスポンス**
```json
{
  "tasks": [/* 作成後の全Task[] */],
  "lastSyncedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### DELETE `/api/tasks/[id]`

指定IDのタスクを削除する。

**パスパラメーター**
| パラメーター | 型 | 説明 |
|------------|-----|------|
| `id` | number | タスクID |

**クエリパラメーター**
| パラメーター | 型 | 必須 | 説明 |
|------------|-----|------|------|
| `syncCode` | string | ✓ | 共有コード（権限確認に使用） |

**レスポンス**
```json
{
  "tasks": [/* 削除後の全Task[] */],
  "lastSyncedAt": "2024-01-15T10:30:00.000Z"
}
```

---

---

## ユーザー管理 API

### GET `/api/users`

全ユーザーの一覧を取得する。

**レスポンス**
```json
{ "users": [/* UserRecord[] */] }
```

---

### POST `/api/users`

新しいユーザーを作成する。

**リクエストボディ**
```json
{ "username": "alice" }
```

- 英数字・ハイフン・アンダースコアのみ使用可（3〜32文字）

**レスポンス** (`201 Created`)
```json
{ "user": /* UserRecord */ }
```

---

### DELETE `/api/users/[username]`

指定ユーザーを削除する（タスクも CASCADE 削除）。

**パスパラメーター**
| パラメーター | 型 | 説明 |
|------------|-----|------|
| `username` | string | ユーザー名 |

**レスポンス**
```json
{ "success": true }
```

---

## ユーザーモード タスク API

### GET `/api/u/[username]/tasks`

指定ユーザーの全タスクを取得する。

**レスポンス**
```json
{
  "tasks": [/* Task[] */],
  "lastSyncedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### POST `/api/u/[username]/tasks`

指定ユーザーにタスクを作成する。

**リクエストボディ**
```json
{
  "task": {
    "date": "2024-01-15",
    "startTime": "09:00",
    "endTime": "10:30",
    "content": "MTGに参加"
  }
}
```

**レスポンス**
```json
{
  "tasks": [/* 作成後の全Task[] */],
  "lastSyncedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### DELETE `/api/u/[username]/tasks/[id]`

指定ユーザーの指定タスクを削除する。

**レスポンス**
```json
{
  "tasks": [/* 削除後の全Task[] */],
  "lastSyncedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Task オブジェクト

```ts
interface Task {
  id: number;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:MM
  endTime: string;     // HH:MM
  content: string;
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}
```

## UserRecord オブジェクト

```ts
interface UserRecord {
  id: string;
  username: string;
  createdAt: string;  // ISO 8601
}
```

## エラーレスポンス

すべてのエンドポイントは、エラー時に HTTP 4xx/5xx と以下のボディを返します。

```json
{ "error": "エラーメッセージ" }
```

| ステータス | 条件 |
|----------|------|
| 400 | リクエストパラメーター不正 |
| 404 | タスクが存在しない |
| 500 | サーバー内部エラー |
