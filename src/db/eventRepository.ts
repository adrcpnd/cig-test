import type { Database } from "sqlite";
import type { Event } from "../domain/event";

export class EventRepository {
  constructor(private db: Database) {}

  async getFutureEvents(): Promise<Event[]> {
    return await this.db.all(
      "SELECT * FROM events WHERE isTriggered = 0 ORDER BY time ASC",
    );
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
