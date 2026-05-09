# フロントエンドコンポーネント

## ページ

| ファイル | URL | 説明 |
| --- | --- | --- |
| `src/pages/index.astro` | `/` | owner ワークスペース |
| `src/pages/pc.astro` | `/pc` | owner ワークスペースの PC 版 |
| `src/pages/admin.astro` | `/admin` | 管理パネル |
| `src/pages/u.astro` | `/:username`, `/:username/pc` | ユーザー別ワークスペース |

## React コンポーネント

### `UserApp.tsx`

ユーザー別タスクの取得・追加・削除、10秒ポーリング、タブ復帰時同期を担当します。

### `AdminApp.tsx`

ユーザー一覧、作成、削除を担当します。

### `EntryForm.tsx`

日付・開始時刻・終了時刻・内容の入力フォームです。PC 版では `TimePickerDialog` を使います。

### `TaskList.tsx`

タスク一覧と削除ボタンを表示します。

### `ReportPreview.tsx`

日報テキスト、コピー操作、週合計時間を表示します。

### `TimePickerDialog.tsx`

PC 版専用のカスタム時刻ピッカーです。

## ユーティリティ

### `api.ts`

FastAPI のユーザー別 API とユーザー管理 API を呼び出します。

### `utils.ts`

- `parseTask` — 6時前を前日扱いに変換
- `groupTasks` — 日付別・内容別にグループ化
- `formatReport` — 日報テキストを生成
- `calculateWeekTotals` — 月曜 6:00 から翌月曜 5:59 までの週合計を算出
