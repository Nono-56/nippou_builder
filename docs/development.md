# 開発ガイド

## セットアップ

```bash
npm install
```

## ローカル開発

### フロントエンドのみ（API不使用）

```bash
npm run dev
```

`http://localhost:4321` でアクセス可能。APIは使えないのでローカルモードのみ動作。

### Cloudflare Functions + D1込みで開発

```bash
# DBの初期化（初回のみ）
npm run db:migrate:local

# ビルド + Wranglerでローカル起動
npm run cf:dev
```

`http://localhost:8788` でアクセス可能。D1データベースも使える。

## スクリプト一覧

| コマンド | 説明 |
|--------|------|
| `npm run dev` | Astro開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run preview` | 本番ビルドのプレビュー |
| `npm run cf:dev` | ビルド後、Wranglerでローカル起動（Functions対応） |
| `npm run cf:deploy` | Cloudflare Pagesへデプロイ |
| `npm run db:migrate:local` | ローカルD1 DBにマイグレーション適用 |

## デプロイ

```bash
npm run cf:deploy
```

デプロイ先: Cloudflare Pages（`wrangler.toml` の設定に従う）

### 本番DBのマイグレーション

```bash
wrangler d1 execute nippou-builder-db --file=migrations/0001_init.sql
```

## 設定ファイル

### wrangler.toml

| 設定 | 値 |
|-----|-----|
| 互換日 | 2025-09-15 |
| D1バインディング名 | `nippou-builder-db` |
| アセットディレクトリ | `./dist` |
| Database ID | `49c30d41-2b6b-4405-b66b-9cb3b56235c9` |

### tsconfig.json

| 設定 | 値 |
|-----|-----|
| ターゲット | ESNext |
| モジュール解決 | bundler |
| パスエイリアス | `@/*` → `src/*` |
| JSX | react-jsx |
| Strict | true |

## マイグレーション

DBスキーマの変更は `migrations/` にSQLファイルを追加して管理します。

```
migrations/
└── 0001_init.sql   # 初期スキーマ（sync_spaces, tasks テーブル）
```

新しいマイグレーションファイルは連番で追加してください（`0002_xxx.sql` など）。
