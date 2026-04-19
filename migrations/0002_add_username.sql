ALTER TABLE sync_spaces ADD COLUMN username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sync_spaces_username ON sync_spaces(username);
