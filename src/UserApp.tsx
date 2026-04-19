import React, { useEffect, useEffectEvent, useState } from 'react';
import { BookOpenText, Cloud, LoaderCircle } from 'lucide-react';
import { createTaskByUsername, fetchTasksByUsername, removeTaskByUsername } from './api';
import { EntryForm } from './components/EntryForm';
import { ReportPreview } from './components/ReportPreview';
import { TaskList } from './components/TaskList';
import type { SyncStatus, TaskInput } from './types';

type UserAppProps = {
  username: string;
  useCustomPicker?: boolean;
};

function SyncIndicator({ status, lastSyncedAt }: { status: SyncStatus; lastSyncedAt: string | null }) {
  const isBusy = status === 'connecting' || status === 'syncing';
  const label = status === 'connecting' ? '接続中' : status === 'syncing' ? '同期中' : '同期済み';

  const formatted = lastSyncedAt
    ? new Intl.DateTimeFormat('ja-JP', { timeStyle: 'medium' }).format(new Date(lastSyncedAt))
    : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted, #94a3b8)' }}>
      {isBusy ? <LoaderCircle size={14} className="spin" /> : <Cloud size={14} />}
      <span>{label}</span>
      {formatted && <span style={{ marginLeft: '0.5rem' }}>最終同期: {formatted}</span>}
    </div>
  );
}

function UserApp({ username, useCustomPicker = false }: UserAppProps) {
  const [tasks, setTasks] = useState<TaskInput[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  async function loadTasks() {
    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const response = await fetchTasksByUsername(username);
      setTasks(response.tasks);
      setLastSyncedAt(response.lastSyncedAt);
      setSyncStatus('connected');
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : '同期に失敗しました。');
      setSyncStatus('connected');
    }
  }

  const refreshTasks = useEffectEvent(loadTasks);

  useEffect(() => {
    loadTasks().catch(() => {
      setSyncStatus('connected');
    });
  }, [username]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refreshTasks().catch(() => {});
    }, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshTasks().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleAddTask = async (task: TaskInput) => {
    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const response = await createTaskByUsername(username, task);
      setTasks(response.tasks);
      setLastSyncedAt(response.lastSyncedAt);
      setSyncStatus('connected');
    } catch (error) {
      setSyncStatus('connected');
      setSyncError(error instanceof Error ? error.message : 'タスク保存に失敗しました。');
      throw error;
    }
  };

  const handleDeleteTask = async (id: string) => {
    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const response = await removeTaskByUsername(username, id);
      setTasks(response.tasks);
      setLastSyncedAt(response.lastSyncedAt);
      setSyncStatus('connected');
    } catch (error) {
      setSyncStatus('connected');
      setSyncError(error instanceof Error ? error.message : 'タスク削除に失敗しました。');
      throw error;
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>
          <BookOpenText className="inline-block mr-2 align-text-bottom text-blue-400" size={36} />
          Nippou Builder
        </h1>
        <p style={{ marginBottom: '0.25rem' }}>
          <span style={{ fontWeight: 600, color: '#a78bfa' }}>@{username}</span>
        </p>
        <SyncIndicator status={syncStatus} lastSyncedAt={lastSyncedAt} />

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
          {!useCustomPicker ? (
            <a href={`/${username}/pc`} className="btn-text" style={{ background: 'rgba(255,255,255,0.05)', display: 'inline-block' }}>
              💻 Switch to PC Version (Custom Clock)
            </a>
          ) : (
            <a href={`/${username}`} className="btn-text" style={{ background: 'rgba(255,255,255,0.05)', display: 'inline-block' }}>
              📱 Switch to Mobile Version (Native)
            </a>
          )}
        </div>
      </header>

      {syncError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.9rem' }}>
          {syncError}
        </div>
      )}

      <EntryForm onAdd={handleAddTask} useCustomPicker={useCustomPicker} />

      <TaskList tasks={tasks} onDelete={handleDeleteTask} />

      <ReportPreview tasks={tasks} />
    </div>
  );
}

export default UserApp;
