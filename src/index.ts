import { initializeDatabase } from "./db/database";
import { EventRepository } from "./db/eventRepository";
import { Scheduler } from "./scheduler/scheduler";
import { WebsocketServer } from "./websocket/websocketServer";
import { EventService } from "./services/eventService";

async function bootstrap() {
  const db = await initializeDatabase();
  const eventRepository = new EventRepository(db);

  const scheduler = new Scheduler();
  const websocketServer = new WebsocketServer();

  const eventService = new EventService(
    eventRepository,
    websocketServer,
    scheduler,
  );

  // Register the EventService.createEvent as the handler for CREATE_EVENT
  websocketServer.setCreateEventHandler(
    eventService.createEvent.bind(eventService),
  );

  const futureEvents = await eventRepository.getFutureEvents();
  futureEvents.forEach((event) => {
    eventService.scheduleEvent(event);
  });

  websocketServer.start(8080);
}

bootstrap();
