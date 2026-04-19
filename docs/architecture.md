# アーキテクチャ

## データフロー

### ローカルモード（同期なし）

```
ユーザー入力 → React State (localTasks) → localStorage → 表示・日報生成
```

### 同期モード

```
1. 共有コード入力 → POST /api/sync/connect（コードをSHA-256でハッシュ化）
2. サーバーがsync_spaceを作成（または既存を返す）→ 全タスクを返却
3. ReactがremoteTasksを保持、10秒ごとにポーリング
4. タブフォーカス時に即時再同期
5. タスク追加 → POST /api/tasks → サーバーに保存 → 全タスクを返却
6. タスク削除 → DELETE /api/tasks/[id] → サーバーから削除 → 全タスクを返却
```

### 日報生成フロー

```
生タスク → parseTask()    # 深夜時刻の処理（6時前は前日扱い）
         → groupTasks()   # 日付別・内容別にグループ化
         → formatReport() # テキスト形式にフォーマット（時間計算付き）
         → クリップボードにコピー
```

## データベーススキーマ

```sql
sync_spaces:
  id          INTEGER PRIMARY KEY
  code_hash   TEXT UNIQUE  -- SHA-256ハッシュ（平文は保存しない）
  created_at  TEXT
  updated_at  TEXT

tasks:
  id          INTEGER PRIMARY KEY
  space_id    INTEGER REFERENCES sync_spaces(id)
  date        TEXT  -- YYYY-MM-DD
  start_time  TEXT  -- HH:MM
  end_time    TEXT  -- HH:MM
  content     TEXT
  created_at  TEXT
  updated_at  TEXT
```

## 主な設計判断

### セキュリティ
- **共有コードは平文保存なし** — SHA-256でハッシュ化してDBに保存
- サーバーは共有コードを知らず、ハッシュのみで照合

### 同期戦略
- **サーバーが正**（Source of Truth） — 同期後はサーバーのデータが優先
- **ステートレスAPI** — 各リクエストが全タスクを返すことで競合を簡略化
- **10秒ポーリング + visibility change** — アクティブな端末間でほぼリアルタイム同期

### UI設計
- **深夜タスク** — 6時前は前日の論理日付に紐付け
- **タスクグループ化** — 同内容の複数タスクは日報でまとめて表示
- **PC/モバイル分離** — `/pc` でカスタム時計ピッカー、`/` でネイティブHTML入力

### スタイリング
- **グラスモーフィズム** — ダークテーマ + バックドロップブラー
- **カラーパレット**: Primary `#3b82f6`（青）、Accent `#a78bfa`（紫）、BG `#0f172a`
- **フォント**: Inter（本文）、Outfit（見出し）
