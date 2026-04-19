import React, { useEffect, useState } from 'react';
import { BookOpenText, Trash2, UserPlus, Users } from 'lucide-react';
import { createUser, deleteUser, fetchUsers, type UserRecord } from './api';

function AdminApp() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers()
      .then((data) => setUsers(data.users))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'ユーザー一覧の取得に失敗しました。'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = newUsername.trim();
    if (!username) return;

    setCreating(true);
    setError(null);
    try {
      const data = await createUser(username);
      setUsers((prev) => [...prev, data.user]);
      setNewUsername('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ユーザー作成に失敗しました。');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (username: string, id: string) => {
    if (!confirm(`@${username} を削除しますか？タスクもすべて削除されます。`)) return;

    setDeletingId(id);
    setError(null);
    try {
      await deleteUser(username);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ユーザー削除に失敗しました。');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>
          <BookOpenText className="inline-block mr-2 align-text-bottom text-blue-400" size={36} />
          Nippou Builder
        </h1>
        <p>管理パネル</p>
      </header>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <section className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <h2 className="section-title">
          <UserPlus size={20} />
          ユーザーを追加
        </h2>
        <form onSubmit={(e) => { void handleCreate(e); }} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label htmlFor="new-username">ユーザー名</label>
            <input
              id="new-username"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="例: alice"
              pattern="[a-zA-Z0-9_-]{3,32}"
              title="英数字・ハイフン・アンダースコアで3〜32文字"
              disabled={creating}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={creating || !newUsername.trim()}>
            {creating ? '作成中…' : '作成'}
          </button>
        </form>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #94a3b8)', marginTop: '0.5rem', marginBottom: 0 }}>
          英数字・ハイフン・アンダースコアのみ使用可（3〜32文字）
        </p>
      </section>

      <section className="glass-panel">
        <h2 className="section-title">
          <Users size={20} />
          ユーザー一覧
        </h2>

        {loading ? (
          <p style={{ color: 'var(--color-text-muted, #94a3b8)' }}>読み込み中…</p>
        ) : users.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted, #94a3b8)' }}>ユーザーがいません。</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {users.map((user) => (
              <li
                key={user.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '0.5rem',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <a
                      href={`/${user.username}`}
                      style={{ fontWeight: 600, color: '#a78bfa', textDecoration: 'none' }}
                    >
                      @{user.username}
                    </a>
                    <a
                      href={`/${user.username}/pc`}
                      style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none' }}
                    >
                      PC版
                    </a>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    作成日: {new Intl.DateTimeFormat('ja-JP', { dateStyle: 'short' }).format(new Date(user.createdAt))}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-textual"
                  style={{ color: '#ef4444', padding: '0.4rem' }}
                  onClick={() => { void handleDelete(user.username, user.id); }}
                  disabled={deletingId === user.id}
                  title={`@${user.username} を削除`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default AdminApp;
