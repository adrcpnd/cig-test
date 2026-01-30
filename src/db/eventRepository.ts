import type { Database } from "sqlite";
import type { Event } from "../domain/event";

export class EventRepository {
  constructor(private db: Database) {}

  async getFutureEvents(): Promise<Event[]> {
    type DBEventRow = {
      id: string;
      name: string;
      time: number | string;
      isTriggered: number | boolean | null;
    };

    const rows: DBEventRow[] = await this.db.all(
      "SELECT * FROM events WHERE isTriggered = 0 ORDER BY time ASC",
    );

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      time: Number(r.time),
      isTriggered: Boolean(r.isTriggered),
    }));
  }

  async insertEvent(event: Event) {
    return await this.db.run(
      "INSERT INTO events (id, name, time, isTriggered) VALUES (?, ?, ?, ?)",
      event.id,
      event.name,
      event.time,
      event.isTriggered,
    );
  }

  async setIsTriggered(id: string) {
    return await this.db.run(
      "UPDATE events SET isTriggered = TRUE WHERE id = ?",
      id,
    );
  }
}
