import { initializeDatabase } from "../../../src/db/database";
import { existsSync, unlinkSync } from "fs";

describe("Database initialization", () => {
  test("creates events table", async () => {
    const db = await initializeDatabase();

    const row = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='events'",
    );
    expect(row).toBeDefined();
    await db.close();

    // cleanup file if created
    if (existsSync("events.db")) {
      try {
        unlinkSync("events.db");
      } catch (_) {}
    }
  });
});
