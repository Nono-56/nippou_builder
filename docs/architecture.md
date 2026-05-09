# アーキテクチャ

## データフロー

### ユーザー別ワークスペース

```text
1. URL から username を取得
2. 初回マウントで GET /api/u/{username}/tasks
3. 10秒ごと + visibilitychange で再同期
4. タスク追加は POST /api/u/{username}/tasks
5. タスク削除は DELETE /api/u/{username}/tasks/{task_id}
6. API は操作後の全タスクと lastSyncedAt を返す
```

### 管理パネル

```text
AdminApp -> GET /api/users
         -> POST /api/users
         -> DELETE /api/users/{username}
```

### 日報生成

```text
生タスク -> parseTask()    # 6時前は前日扱い
        -> groupTasks()   # 日付別・内容別にグループ化
        -> formatReport() # 日報テキストに整形
```

### 週合計

```text
生タスク -> parseTask()
        -> calculateWeekTotals()
        -> 月曜 6:00 から翌月曜 5:59 までの合計を表示
```

週判定は日報生成と同じ論理日付を使います。月曜 5:59 のタスクは前週、月曜 6:00 のタスクは新しい週に入ります。

## DB スキーマ

```sql
sync_spaces:
  id          TEXT PRIMARY KEY
  username    TEXT UNIQUE
  created_at  TEXT
  updated_at  TEXT

tasks:
  id          TEXT PRIMARY KEY
  space_id    TEXT REFERENCES sync_spaces(id)
  date        TEXT
  start_time  TEXT
  end_time    TEXT
  content     TEXT
  created_at  TEXT
  updated_at  TEXT
```

既存 SQLite に旧 `code_hash` 列が残っている場合でも、API はユーザー別ワークスペースのみを使います。

## デプロイ

Dokploy の Docker Compose アプリとして `nginx + FastAPI + SQLite` を起動します。Nginx は静的ファイルを配信し、`/api/` と `/health` を FastAPI にプロキシします。未知のユーザー URL は `u` ページへフォールバックします。
