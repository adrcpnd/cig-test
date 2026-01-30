import type { EventRepository } from "../db/eventRepository";
import type { Event } from "../domain/event";
import type { Scheduler } from "../scheduler/scheduler";
import type { WebsocketServer } from "../websocket/websocketServer";

export class EventService {
  constructor(
    private eventRepository: EventRepository,
    private websocketServer: WebsocketServer,
    private scheduler: Scheduler,
  ) {}

  async createEvent(name: string, time: number) {
    const event: Event = {
      id: crypto.randomUUID(),
      name,
      time,
      isTriggered: false,
    };
    console.log("Creating event", event);
    await this.eventRepository.insertEvent(event);
    this.scheduleEvent(event);
  }

  scheduleEvent(event: Event) {
    this.scheduler.schedule(event, async (triggeredEvent) => {
      console.log("Event triggered", triggeredEvent);

      await this.eventRepository.setIsTriggered(triggeredEvent.id);

      this.websocketServer.notifyAllClients({
        type: "EVENTS_TRIGGERED",
        payload: triggeredEvent,
      });
    });
  }
}
