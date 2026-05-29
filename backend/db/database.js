const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const db = new Database('./data.db');

db.exec(`
CREATE TABLE IF NOT EXISTS documents (
id TEXT PRIMARY KEY,
filename TEXT NOT NULL,
original_name TEXT NOT NULL,
size INTEGER NOT NULL,
mime_type TEXT NOT NULL,
path TEXT NOT NULL,
status TEXT DEFAULT 'complete',
uploaded_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS notifications (
id TEXT PRIMARY KEY,
message TEXT NOT NULL,
type TEXT DEFAULT 'info',
read INTEGER DEFAULT 0,
created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS upload_sessions (
id TEXT PRIMARY KEY,
total_files INTEGER NOT NULL,
processed INTEGER DEFAULT 0,
status TEXT DEFAULT 'pending',
created_at TEXT DEFAULT (datetime('now'))
);
`);

module.exports = { db, uuidv4 };
