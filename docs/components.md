# フロントエンドコンポーネント

## ページ

| ファイル | URL | 説明 |
|--------|-----|------|
| [src/pages/index.astro](../src/pages/index.astro) | `/` | 共有コードモード・モバイル版 |
| [src/pages/pc.astro](../src/pages/pc.astro) | `/pc` | 共有コードモード・PC版（カスタム時計ピッカー） |
| [src/pages/admin.astro](../src/pages/admin.astro) | `/admin` | 管理パネル（ユーザー管理） |
| [src/pages/u.astro](../src/pages/u.astro) | `/[username]`, `/[username]/pc` | ユーザーモード（UserAppShell 経由） |

## Reactコンポーネント

### App.tsx
共有コードモードのアプリ。状態管理・同期オーケストレーション・localStorage管理を担当。

**主な状態**
- `localTasks` — 未接続時のローカルタスク
- `remoteTasks` — サーバーから取得したタスク
- `connectedSyncCode` — 現在の接続済み共有コード
- `syncStatus` — `disconnected | connecting | syncing | connected`

**主な処理**
- 10秒ポーリング（接続中のみ）
- `visibilitychange` イベントで即時再同期
- localStorage への永続化

---

### AdminApp.tsx
管理パネル。`/admin` ページで使用。ユーザーの一覧表示・作成・削除を担当。

**主な処理**
- `GET /api/users` でユーザー一覧取得
- `POST /api/users` でユーザー作成（英数字・ハイフン・アンダースコア、3〜32文字）
- `DELETE /api/users/[username]` でユーザー削除（タスクも削除）

---

### UserApp.tsx
ユーザーモードのアプリ。`/@username` ページで使用。共有コード不要でユーザー専用タスクを管理。

**Props**
```ts
type UserAppProps = {
  username: string;
  useCustomPicker?: boolean;
};
```

**主な処理**
- 初回マウント時に `GET /api/u/[username]/tasks` でタスク取得
- 10秒ポーリング + `visibilitychange` で即時再同期
- `SyncIndicator` コンポーネントで同期状態を表示

---

### UserAppShell.tsx
`/u.astro` ページのエントリポイント。URLパスからusernameを解析して `UserApp` に渡す。

**ルーティングロジック**
- `/alice` → `UserApp({ username: "alice" })`
- `/alice/pc` → `UserApp({ username: "alice", useCustomPicker: true })`
- `/u` や `/admin` などの予約パスはエラー表示

---

### EntryForm.tsx

タスク入力フォーム。日付・開始時刻・終了時刻・内容を入力して送信。

**Props**
```ts
interface Props {
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  useCustomTimePicker?: boolean;  // PC版でtrueにするとTimePickerDialogを使用
}
```

---

### TaskList.tsx

タスク一覧の表示と削除ボタン。

**Props**
```ts
interface Props {
  tasks: Task[];
  onDelete: (id: number) => void;
}
```

---

### ReportPreview.tsx

タスクを日報テキストに変換してプレビュー・クリップボードコピー。

`utils.ts` の `parseTask → groupTasks → formatReport` パイプラインを使用。

**Props**
```ts
interface Props {
  tasks: Task[];
}
```

---

### SyncPanel.tsx

同期状態の表示・共有コード入力・接続/切断操作。

**Props**
```ts
interface Props {
  syncStatus: SyncStatus;
  onConnect: (code: string) => void;
  onDisconnect: () => void;
}
```

---

### TimePickerDialog.tsx

PC版専用のカスタム時計インターフェース。回転式セレクターで時・分を選択。

**Props**
```ts
interface Props {
  value: string;           // HH:MM
  onChange: (value: string) => void;
  onClose: () => void;
}
```

## ユーティリティ

### api.ts

バックエンドとの通信を担当するAPIクライアント関数群。

**共有コードモード**

| 関数 | 説明 |
|-----|------|
| `connectSync(code)` | POST `/api/sync/connect` |
| `fetchTasks(code)` | GET `/api/tasks` |
| `createTask(code, task)` | POST `/api/tasks` |
| `removeTask(code, id)` | DELETE `/api/tasks/[id]` |

**ユーザーモード**

| 関数 | 説明 |
|-----|------|
| `fetchTasksByUsername(username)` | GET `/api/u/[username]/tasks` |
| `createTaskByUsername(username, task)` | POST `/api/u/[username]/tasks` |
| `removeTaskByUsername(username, id)` | DELETE `/api/u/[username]/tasks/[id]` |

**ユーザー管理**

| 関数 | 説明 |
|-----|------|
| `fetchUsers()` | GET `/api/users` |
| `createUser(username)` | POST `/api/users` |
| `deleteUser(username)` | DELETE `/api/users/[username]` |

### utils.ts

タスクのパース・グループ化・日報フォーマット。

| 関数 | 説明 |
|-----|------|
| `parseTask(task)` | 深夜時刻（6時前）を前日扱いに変換 |
| `groupTasks(tasks)` | 日付別・内容別にグループ化 |
| `formatReport(groups)` | 時間計算付きの日報テキストを生成 |

### types.ts

アプリ全体で使用するTypeScript型定義。`Task`、`SyncResponse`、`ParsedTask`、`GroupedTask` など。
