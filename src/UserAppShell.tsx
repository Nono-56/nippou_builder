import React from 'react';
import UserApp from './UserApp';

function parseRoute(): { username: string | null; isPC: boolean } {
  if (typeof window === 'undefined') return { username: null, isPC: false };
  const parts = window.location.pathname.replace(/^\//, '').split('/');
  const username = parts[0] || null;
  const isPC = parts[1] === 'pc';
  return { username, isPC };
}

function UserAppShell() {
  const { username, isPC } = parseRoute();

  if (!username || username === 'u' || username === 'admin') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94a3b8' }}>
        ユーザーが指定されていません。
      </div>
    );
  }

  return <UserApp username={username} useCustomPicker={isPC} />;
}

export default UserAppShell;
