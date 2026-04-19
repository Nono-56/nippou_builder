# フロントエンドコンポーネント

## ページ

| ファイル | URL | 説明 |
|--------|-----|------|
| [src/pages/index.astro](../src/pages/index.astro) | `/` | モバイル版（ネイティブHTML時刻ピッカー） |
| [src/pages/pc.astro](../src/pages/pc.astro) | `/pc` | PC版（カスタム時計ピッカー） |

## Reactコンポーネント

### App.tsx
メインアプリケーション。状態管理・同期オーケストレーション・localStorage管理を担当。

**主な状態**
- `localTasks` — 同期前のローカルタスク
- `remoteTasks` — サーバーから取得したタスク
- `syncCode` — 現在の共有コード
- `syncStatus` — `idle | connecting | connected | error`

**主な処理**
- 10秒ポーリング（同期中のみ）
- `visibilitychange` イベントで即時再同期
- localStorage への永続化

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

| 関数 | 説明 |
|-----|------|
| `connectSync(code)` | `/api/sync/connect` を呼び出し |
| `fetchTasks(code)` | GET `/api/tasks` |
| `createTask(code, task)` | POST `/api/tasks` |
| `removeTask(code, id)` | DELETE `/api/tasks/[id]` |

### utils.ts

タスクのパース・グループ化・日報フォーマット。

| 関数 | 説明 |
|-----|------|
| `parseTask(task)` | 深夜時刻（6時前）を前日扱いに変換 |
| `groupTasks(tasks)` | 日付別・内容別にグループ化 |
| `formatReport(groups)` | 時間計算付きの日報テキストを生成 |

### types.ts

アプリ全体で使用するTypeScript型定義。`Task`、`SyncResponse`、`ParsedTask`、`GroupedTask` など。
