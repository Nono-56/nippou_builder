import React from 'react';
import { Cloud, CloudOff, LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import type { SyncStatus } from '../types';

type SyncPanelProps = {
  draftCode: string;
  connectedCode: string | null;
  status: SyncStatus;
  error: string | null;
  lastSyncedAt: string | null;
  onDraftCodeChange: (value: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
};

function formatLastSyncedAt(lastSyncedAt: string | null): string {
  if (!lastSyncedAt) return '未同期';

  const date = new Date(lastSyncedAt);
  if (Number.isNaN(date.getTime())) return '未同期';

  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(date);
}

export const SyncPanel: React.FC<SyncPanelProps> = ({
  draftCode,
  connectedCode,
  status,
  error,
  lastSyncedAt,
  onDraftCodeChange,
  onConnect,
  onDisconnect,
  onRefresh,
}) => {
  const isBusy = status === 'connecting' || status === 'syncing';
  const isConnected = Boolean(connectedCode);
  const statusLabel =
    status === 'connecting'
      ? '接続中'
      : status === 'syncing'
        ? '同期中'
        : isConnected
          ? '接続済み'
          : '未接続';

  return (
    <section className="glass-panel sync-panel">
      <div className="sync-header">
        <div>
          <h2 className="section-title">
            <ShieldCheck size={20} />
            端末同期
          </h2>
          <p className="sync-description">
            同じ共有コードを入力した端末同士で、サーバー側のタスクリストを共有します。
          </p>
        </div>
        <span className={`sync-badge sync-badge-${status}`}>
          {isBusy ? <LoaderCircle size={14} className="spin" /> : isConnected ? <Cloud size={14} /> : <CloudOff size={14} />}
          {statusLabel}
        </span>
      </div>

      <div className="form-group">
        <label htmlFor="sync-code">共有コード</label>
        <input
          id="sync-code"
          type="text"
          value={draftCode}
          onChange={(event) => onDraftCodeChange(event.target.value)}
          placeholder="例: my-team-report"
          autoComplete="off"
          spellCheck={false}
          disabled={isBusy}
        />
      </div>

      <div className="sync-actions">
        <button type="button" className="btn btn-primary sync-main-action" onClick={onConnect} disabled={isBusy}>
          {isConnected ? '再接続して更新' : '接続'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onRefresh} disabled={!isConnected || isBusy}>
          <RefreshCw size={16} />
          再同期
        </button>
        <button type="button" className="btn btn-textual" onClick={onDisconnect} disabled={!isConnected || isBusy}>
          切断
        </button>
      </div>

      <div className="sync-meta">
        <span>接続中コード: {connectedCode ?? 'なし'}</span>
        <span>最終同期: {formatLastSyncedAt(lastSyncedAt)}</span>
      </div>

      {error ? <p className="sync-error">{error}</p> : null}
    </section>
  );
};
