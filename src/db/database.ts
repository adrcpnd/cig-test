import { open, type Database as SqliteDB } from "sqlite";
import sqlite3 from "sqlite3";

const sqlite3Driver =
  (sqlite3 as any)?.Database ?? (sqlite3 as any)?.default?.Database ?? sqlite3;

export async function initializeDatabase(): Promise<SqliteDB> {
  const db = await open({
    filename: "events.db",
    driver: sqlite3Driver,
  });

  await db.exec(`
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            time INTEGER NOT NULL,
            isTriggered BOOLEAN NOT NULL DEFAULT 0
        )
    `);

  return db;
}
