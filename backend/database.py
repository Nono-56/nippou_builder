import hashlib
import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Optional

DB_PATH = os.environ.get("DB_PATH", "/data/nippou.db")


def get_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_sync_code(sync_code: str) -> str:
    return hashlib.sha256(sync_code.strip().encode("utf-8")).hexdigest()


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS sync_spaces (
                id TEXT PRIMARY KEY,
                code_hash TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                space_id TEXT NOT NULL,
                date TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (space_id) REFERENCES sync_spaces(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_tasks_space_id ON tasks(space_id);
            CREATE INDEX IF NOT EXISTS idx_tasks_space_sort
                ON tasks(space_id, date, start_time, created_at);
        """)
        cols = [r[1] for r in conn.execute("PRAGMA table_info(sync_spaces)").fetchall()]
        if "username" not in cols:
            conn.execute("ALTER TABLE sync_spaces ADD COLUMN username TEXT")
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_sync_spaces_username "
            "ON sync_spaces(username) WHERE username IS NOT NULL"
        )


def _list_tasks(conn, space_id: str) -> list[dict]:
    rows = conn.execute(
        """SELECT id, date, start_time, end_time, content
           FROM tasks
           WHERE space_id = ?
           ORDER BY date ASC, start_time ASC, created_at ASC""",
        (space_id,),
    ).fetchall()
    return [
        {
            "id": r["id"],
            "date": r["date"],
            "startTime": r["start_time"],
            "endTime": r["end_time"],
            "content": r["content"],
        }
        for r in rows
    ]


def _touch_space(conn, space_id: str) -> str:
    now = get_now()
    conn.execute("UPDATE sync_spaces SET updated_at = ? WHERE id = ?", (now, space_id))
    return now


# ── Sync-code-based operations ─────────────────────────────────

def get_or_create_space(sync_code: str) -> dict:
    code_hash = hash_sync_code(sync_code)
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, updated_at FROM sync_spaces WHERE code_hash = ?", (code_hash,)
        ).fetchone()
        if row:
            space_id, updated_at = row["id"], row["updated_at"]
        else:
            now = get_now()
            space_id = str(uuid.uuid4())
            conn.execute(
                "INSERT INTO sync_spaces (id, code_hash, created_at, updated_at) VALUES (?,?,?,?)",
                (space_id, code_hash, now, now),
            )
            updated_at = now
        tasks = _list_tasks(conn, space_id)
        return {"tasks": tasks, "lastSyncedAt": updated_at}


def require_space_by_code(sync_code: str) -> Optional[dict]:
    code_hash = hash_sync_code(sync_code)
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, updated_at FROM sync_spaces WHERE code_hash = ?", (code_hash,)
        ).fetchone()
        if not row:
            return None
        tasks = _list_tasks(conn, row["id"])
        return {"tasks": tasks, "lastSyncedAt": row["updated_at"]}


def insert_task_by_code(sync_code: str, task: dict) -> dict:
    code_hash = hash_sync_code(sync_code)
    now = get_now()
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id FROM sync_spaces WHERE code_hash = ?", (code_hash,)
        ).fetchone()
        if not row:
            space_id = str(uuid.uuid4())
            conn.execute(
                "INSERT INTO sync_spaces (id, code_hash, created_at, updated_at) VALUES (?,?,?,?)",
                (space_id, code_hash, now, now),
            )
        else:
            space_id = row["id"]
        conn.execute(
            """INSERT INTO tasks
               (id, space_id, date, start_time, end_time, content, created_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?)""",
            (task["id"], space_id, task["date"], task["startTime"],
             task["endTime"], task["content"], now, now),
        )
        last_synced = _touch_space(conn, space_id)
        tasks = _list_tasks(conn, space_id)
        return {"tasks": tasks, "lastSyncedAt": last_synced}


def delete_task_by_code(sync_code: str, task_id: str) -> Optional[dict]:
    code_hash = hash_sync_code(sync_code)
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id FROM sync_spaces WHERE code_hash = ?", (code_hash,)
        ).fetchone()
        if not row:
            return None
        space_id = row["id"]
        conn.execute("DELETE FROM tasks WHERE id = ? AND space_id = ?", (task_id, space_id))
        last_synced = _touch_space(conn, space_id)
        tasks = _list_tasks(conn, space_id)
        return {"tasks": tasks, "lastSyncedAt": last_synced}


# ── Username-based operations ──────────────────────────────────

def require_space_by_username(username: str) -> Optional[dict]:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, updated_at FROM sync_spaces WHERE username = ?", (username,)
        ).fetchone()
        if not row:
            return None
        tasks = _list_tasks(conn, row["id"])
        return {"tasks": tasks, "lastSyncedAt": row["updated_at"]}


def insert_task_by_username(username: str, task: dict) -> Optional[dict]:
    now = get_now()
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id FROM sync_spaces WHERE username = ?", (username,)
        ).fetchone()
        if not row:
            return None
        space_id = row["id"]
        conn.execute(
            """INSERT INTO tasks
               (id, space_id, date, start_time, end_time, content, created_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?)""",
            (task["id"], space_id, task["date"], task["startTime"],
             task["endTime"], task["content"], now, now),
        )
        last_synced = _touch_space(conn, space_id)
        tasks = _list_tasks(conn, space_id)
        return {"tasks": tasks, "lastSyncedAt": last_synced}


def delete_task_by_username(username: str, task_id: str) -> Optional[dict]:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id FROM sync_spaces WHERE username = ?", (username,)
        ).fetchone()
        if not row:
            return None
        space_id = row["id"]
        conn.execute("DELETE FROM tasks WHERE id = ? AND space_id = ?", (task_id, space_id))
        last_synced = _touch_space(conn, space_id)
        tasks = _list_tasks(conn, space_id)
        return {"tasks": tasks, "lastSyncedAt": last_synced}


# ── User management ────────────────────────────────────────────

def list_users() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, username, created_at FROM sync_spaces "
            "WHERE username IS NOT NULL ORDER BY created_at ASC"
        ).fetchall()
        return [
            {"id": r["id"], "username": r["username"], "createdAt": r["created_at"]}
            for r in rows
        ]


def create_user(username: str) -> Optional[dict]:
    now = get_now()
    space_id = str(uuid.uuid4())
    code_hash = hash_sync_code(username)
    with get_conn() as conn:
        if conn.execute(
            "SELECT id FROM sync_spaces WHERE username = ?", (username,)
        ).fetchone():
            return None
        conn.execute(
            "INSERT INTO sync_spaces (id, code_hash, username, created_at, updated_at) VALUES (?,?,?,?,?)",
            (space_id, code_hash, username, now, now),
        )
        return {"id": space_id, "username": username, "createdAt": now}


def delete_user(username: str) -> bool:
    with get_conn() as conn:
        cur = conn.execute("DELETE FROM sync_spaces WHERE username = ?", (username,))
        return cur.rowcount > 0
