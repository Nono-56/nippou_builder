import React, { useEffect, useEffectEvent, useState } from 'react';
import { BookOpenText } from 'lucide-react';
import { connectSync, createTask, fetchTasks, removeTask } from './api';
import { EntryForm } from './components/EntryForm';
import { ReportPreview } from './components/ReportPreview';
import { SyncPanel } from './components/SyncPanel';
import { TaskList } from './components/TaskList';
import type { SyncStatus, TaskInput } from './types';

type AppProps = {
  useCustomPicker?: boolean;
};

const LOCAL_TASKS_KEY = 'nippou-tasks';
const SYNC_CODE_KEY = 'nippou-sync-code';

function App({ useCustomPicker = false }: AppProps) {
  const [localTasks, setLocalTasks] = useState<TaskInput[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_TASKS_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [remoteTasks, setRemoteTasks] = useState<TaskInput[]>([]);
  const [draftSyncCode, setDraftSyncCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SYNC_CODE_KEY) ?? '';
    }
    return '';
  });
  const [connectedSyncCode, setConnectedSyncCode] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('disconnected');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(localTasks));
  }, [localTasks]);

  async function syncWithServer(syncCode: string, mode: 'connecting' | 'syncing') {
    setSyncStatus(mode);
    setSyncError(null);

    const response = mode === 'connecting' ? await connectSync(syncCode) : await fetchTasks(syncCode);

    setRemoteTasks(response.tasks);
    setConnectedSyncCode(syncCode);
    setDraftSyncCode(syncCode);
    setLastSyncedAt(response.lastSyncedAt);
    setSyncStatus('connected');
    localStorage.setItem(SYNC_CODE_KEY, syncCode);
  }

  const refreshRemoteTasks = useEffectEvent(async () => {
    if (!connectedSyncCode) return;
    await syncWithServer(connectedSyncCode, 'syncing');
  });

  useEffect(() => {
    const storedSyncCode = localStorage.getItem(SYNC_CODE_KEY);
    if (!storedSyncCode) return;

    syncWithServer(storedSyncCode, 'connecting').catch((error: unknown) => {
      setConnectedSyncCode(null);
      setSyncStatus('disconnected');
      setSyncError(error instanceof Error ? error.message : '同期接続の復元に失敗しました。');
      localStorage.removeItem(SYNC_CODE_KEY);
    });
  }, []);

  useEffect(() => {
    if (!connectedSyncCode) return;

    const intervalId = window.setInterval(() => {
      refreshRemoteTasks().catch((error: unknown) => {
        setSyncStatus('connected');
        setSyncError(error instanceof Error ? error.message : '自動同期に失敗しました。');
      });
    }, 10000);

    const handleFocus = () => {
      refreshRemoteTasks().catch((error: unknown) => {
        setSyncStatus('connected');
        setSyncError(error instanceof Error ? error.message : '同期に失敗しました。');
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connectedSyncCode, refreshRemoteTasks]);

  const handleConnect = async () => {
    const syncCode = draftSyncCode.trim();
    if (!syncCode) {
      setSyncError('共有コードを入力してください。');
      return;
    }

    try {
      await syncWithServer(syncCode, 'connecting');
    } catch (error) {
      setConnectedSyncCode(null);
      setSyncStatus('disconnected');
      setSyncError(error instanceof Error ? error.message : '同期接続に失敗しました。');
    }
  };

  const handleDisconnect = () => {
    setConnectedSyncCode(null);
    setRemoteTasks([]);
    setLastSyncedAt(null);
    setSyncStatus('disconnected');
    setSyncError(null);
    localStorage.removeItem(SYNC_CODE_KEY);
  };

  const handleAddTask = async (task: TaskInput) => {
    if (!connectedSyncCode) {
      setLocalTasks((previous) => [...previous, task]);
      return;
    }

    try {
      setSyncStatus('syncing');
      setSyncError(null);
      const response = await createTask(connectedSyncCode, task);
      setRemoteTasks(response.tasks);
      setLastSyncedAt(response.lastSyncedAt);
      setSyncStatus('connected');
    } catch (error) {
      setSyncStatus('connected');
      setSyncError(error instanceof Error ? error.message : 'タスク保存に失敗しました。');
      throw error;
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!connectedSyncCode) {
      setLocalTasks((previous) => previous.filter((task) => task.id !== id));
      return;
    }

    try {
      setSyncStatus('syncing');
      setSyncError(null);
      const response = await removeTask(connectedSyncCode, id);
      setRemoteTasks(response.tasks);
      setLastSyncedAt(response.lastSyncedAt);
      setSyncStatus('connected');
    } catch (error) {
      setSyncStatus('connected');
      setSyncError(error instanceof Error ? error.message : 'タスク削除に失敗しました。');
      throw error;
    }
  };

  const visibleTasks = connectedSyncCode ? remoteTasks : localTasks;

  return (
    <div className="app-container">
      <header className="header">
        <h1>
          <BookOpenText className="inline-block mr-2 align-text-bottom text-blue-400" size={36} />
          Nippou Builder
        </h1>
        <p>Smart, elegant, and efficient daily reporting.</p>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
          {!useCustomPicker ? (
            <a href="/pc" className="btn-text" style={{ background: 'rgba(255,255,255,0.05)', display: 'inline-block' }}>
              💻 Switch to PC Version (Custom Clock)
            </a>
          ) : (
            <a href="/" className="btn-text" style={{ background: 'rgba(255,255,255,0.05)', display: 'inline-block' }}>
              📱 Switch to Mobile Version (Native)
            </a>
          )}
        </div>
      </header>

      <SyncPanel
        draftCode={draftSyncCode}
        connectedCode={connectedSyncCode}
        status={syncStatus}
        error={syncError}
        lastSyncedAt={lastSyncedAt}
        onDraftCodeChange={setDraftSyncCode}
        onConnect={() => {
          void handleConnect();
        }}
        onDisconnect={handleDisconnect}
        onRefresh={() => {
          refreshRemoteTasks().catch((error: unknown) => {
            setSyncStatus('connected');
            setSyncError(error instanceof Error ? error.message : '手動同期に失敗しました。');
          });
        }}
      />

      <EntryForm onAdd={handleAddTask} useCustomPicker={useCustomPicker} />

      <TaskList tasks={visibleTasks} onDelete={handleDeleteTask} />

      <ReportPreview tasks={visibleTasks} />
    </div>
  );
}

export default App;
