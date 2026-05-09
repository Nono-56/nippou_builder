# プロジェクト概要

**Nippou Builder** は、日報作成を支援する Web アプリです。Dokploy 上の Docker で動作し、ユーザー別のタスク記録・日報フォーマット・週合計時間表示を提供します。

## 主な機能

- **タスク記録** — 日付・開始時刻・終了時刻・内容を入力して記録
- **日報自動フォーマット** — 6時前を前日扱いにして、日付別・内容別に集約
- **週合計表示** — 月曜 6:00 から翌月曜 5:59 までの合計時間を表示
- **ユーザー別ワークスペース** — `/username` と `/username/pc` でユーザーごとのタスクを管理
- **管理パネル** — `/admin` でユーザーの作成・削除
- **PC/モバイル対応** — PC 用カスタム時刻ピッカーとモバイル用ネイティブピッカー

## 技術スタック

| レイヤー | 技術 |
| --- | --- |
| フロントエンド | Astro + React + TypeScript |
| API | FastAPI |
| データベース | SQLite |
| Web サーバー | Nginx |
| デプロイ | Dokploy + Docker Compose |
| 公開 | ラズパイ側 Cloudflare Tunnel (`localhost:8001`) |

## ディレクトリ構成

```text
nippou_builder/
├── backend/              # FastAPI API と SQLite 操作
├── data/                 # SQLite DB 保存先
├── docs/                 # プロジェクト文書
├── nginx/                # 静的配信と API プロキシ
├── public/               # 静的アセット
├── src/                  # Astro/React フロントエンド
├── docker-compose.yml
├── package.json
└── astro.config.mjs
```
