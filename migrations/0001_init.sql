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
CREATE INDEX IF NOT EXISTS idx_tasks_space_sort ON tasks(space_id, date, start_time, created_at);
