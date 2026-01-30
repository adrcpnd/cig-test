import { EventService } from "../../../src/services/eventService";
import type { EventRepository } from "../../../src/db/eventRepository";
import type { WebsocketServer } from "../../../src/websocket/websocketServer";
import type { Scheduler } from "../../../src/scheduler/scheduler";

describe("EventService", () => {
  test("createEvent inserts and schedules event", async () => {
    const insertEvent = jest.fn().mockResolvedValue(undefined);
    const setIsTriggered = jest.fn().mockResolvedValue(undefined);
    const mockRepo = {
      insertEvent,
      setIsTriggered,
    } as unknown as EventRepository;

    const notifyAllClients = jest.fn();
    const mockWs = { notifyAllClients } as unknown as WebsocketServer;

    const schedule = jest.fn();
    const mockScheduler = { schedule } as unknown as Scheduler;

    const svc = new EventService(mockRepo, mockWs, mockScheduler);

    const name = "created-via-test";
    const time = Date.now() + 1000;

    await svc.createEvent(name, time);

    expect(insertEvent).toHaveBeenCalledTimes(1);
    const inserted = insertEvent.mock.calls[0][0];
    expect(inserted.name).toBe(name);
    expect(inserted.time).toBe(time);
    expect(inserted.isTriggered).toBe(false);

    expect(schedule).toHaveBeenCalledTimes(1);
    const scheduledEvent = schedule.mock.calls[0][0];
    const scheduledCallback = schedule.mock.calls[0][1];
    // simulate trigger
    await scheduledCallback(scheduledEvent);

    expect(setIsTriggered).toHaveBeenCalledWith(scheduledEvent.id);
    expect(notifyAllClients).toHaveBeenCalledTimes(1);
  });
});
