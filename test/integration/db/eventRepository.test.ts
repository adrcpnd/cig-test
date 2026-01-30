import { open } from "sqlite";
import sqlite3 from "sqlite3";
import type { Database as SqliteDB } from "sqlite";
import { EventRepository } from "../../../src/db/eventRepository";
import type { Event } from "../../../src/domain/event";
import { tmpdir } from "os";
import { join } from "path";
import { unlinkSync } from "fs";

const sqlite3Driver =
  (sqlite3 as any)?.Database ?? (sqlite3 as any)?.default?.Database ?? sqlite3;

describe("EventRepository", () => {
  let db: SqliteDB;
  let repo: EventRepository;
  let dbFile: string | null = null;

  beforeEach(async () => {
    dbFile = join(tmpdir(), `events-test-${Date.now()}.db`);
    db = await open({ filename: dbFile, driver: sqlite3Driver });
    await db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        time INTEGER NOT NULL,
        isTriggered BOOLEAN NOT NULL DEFAULT 0
      )
    `);
    repo = new EventRepository(db);
  });

  afterEach(async () => {
    if (db) await db.close();
    if (dbFile) {
      try {
        unlinkSync(dbFile);
      } catch (_) {}
    }
  });

  test("insertEvent and getFutureEvents and setIsTriggered", async () => {
    const event: Event = {
      id: "test-1",
      name: "t1",
      time: Date.now() + 1000,
      isTriggered: false,
    };

    await repo.insertEvent(event as Event);

    const rows = await repo.getFutureEvents();
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0]!.id).toBe("test-1");
    expect(typeof rows[0]!.isTriggered).toBe("boolean");

    await repo.setIsTriggered("test-1");

    // query raw to ensure DB updated
    const raw = await db.get(
      "SELECT isTriggered FROM events WHERE id = ?",
      "test-1",
    );
    expect(raw.isTriggered === 1 || raw.isTriggered === true).toBeTruthy();
  });
});
