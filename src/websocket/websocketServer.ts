import { WebSocket, WebSocketServer } from "ws";
import type { ClientMessage, ServerMessage } from "../types/websocket";
// import type { EventService } from "../services/eventService";

export class WebsocketServer {
  private wss!: WebSocketServer;
  private createEventHandler?: (name: string, time: number) => Promise<void>;

  start(port: number): void {
    this.wss = new WebSocketServer({ port });

    this.wss.on("connection", (ws) => {
      ws.on("message", (data) => {
        this.handleMessage(ws, data.toString());
      });
    });

    console.log(`WebSocket server started on ws://localhost:${port}`);
  }

  notifyAllClients(message: ServerMessage): void {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  setCreateEventHandler(
    handler: (name: string, time: number) => Promise<void>,
  ) {
    this.createEventHandler = handler;
  }

  private handleMessage(ws: WebSocket, message: string): void {
    const parsedMessage: ClientMessage = JSON.parse(message);
    switch (parsedMessage.type) {
      case "CREATE_EVENT":
        if (!parsedMessage.payload) return;

        if (!this.createEventHandler) {
          console.warn("No createEvent handler registered");
          return;
        }

        this.createEventHandler(
          parsedMessage.payload.name,
          parsedMessage.payload.time,
        )
          .then(() => {
            console.log(
              "Event created via WebSocket:",
              parsedMessage.payload.name,
            );
          })
          .catch((err) => {
            console.error("Error creating event via WebSocket:", err);
          });
        break;

      default:
        console.warn("Unknown message type:", parsedMessage.type);
    }
  }
}
