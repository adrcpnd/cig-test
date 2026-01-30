# Event Reminder Service

Small Node + TypeScript service that accepts WebSocket commands to create event reminders, persists them to SQLite, schedules triggers, and notifies all connected clients when an event triggers.

## Features

- Accept `CREATE_EVENT` messages over WebSocket with a `name` and `time` (epoch ms).
- Persist events in SQLite so scheduled reminders survive process restarts.
- In-memory scheduler re-schedules pending events on startup.
- Broadcast `EVENTS_TRIGGERED` messages to all connected clients when an event triggers.

## Architecture Overview

- `src/db/database.ts` — opens SQLite DB and ensures the `events` table exists.
- `src/db/eventRepository.ts` — CRUD access to the `events` table. Normalizes DB types to domain types.
- `src/services/eventService.ts` — business logic: create event, persist, schedule, and handle trigger (set DB flag + notify clients).
- `src/scheduler/scheduler.ts` — in-memory timer management (schedule, cancel). Short-lived timers kept in a Map.
- `src/websocket/websocketServer.ts` — WebSocket server: parse messages, register create-event handler, broadcast messages to clients.
- `src/index.ts` — bootstrap: initialize DB, construct components, register handlers, schedule pending events, start WebSocket server.

Data flows: WebSocket -> `EventService.createEvent()` -> `EventRepository.insertEvent()` -> `Scheduler.schedule()` -> on trigger -> `EventRepository.setIsTriggered()` + `WebsocketServer.notifyAllClients()`.

## Message Protocol

- Client -> Server: `CREATE_EVENT` with payload `{ name: string, time: number }`.
- Server -> Clients: `EVENTS_TRIGGERED` with payload matching the `Event` domain object.

## Persistence & Restart Behaviour

- Events are stored in `events.db` (SQLite). On startup the bootstrap reads untriggered events and re-schedules them using the in-memory `Scheduler`.
- The `isTriggered` flag is set in DB when the scheduler runs the trigger callback.

## Running

Install dependencies:

```bash
npm install
```

Build + start:

```bash
npm run start
```

Default WebSocket port (from `src/index.ts`) is `8080`.

Example client (see `src/client.js`) sends a `CREATE_EVENT` message.

## Testing

Unit and integration tests are configured with Jest. Run:

Run all tests

```bash
npm run test
```

Run unit tests alone

```bash
npm run test-unit
```

Run integration tests alone

```bash
npm run test-integration
```
