import WebSocket from "ws";
import { WebsocketServer } from "../../../src/websocket/websocketServer";
import type { Event } from "../../../src/domain/event";

function waitForOpen(ws: WebSocket) {
  return new Promise<void>((resolve) => {
    if (ws.readyState === WebSocket.OPEN) return resolve();
    ws.on("open", () => resolve());
  });
}

describe("WebsocketServer integration", () => {
  test("invokes create handler on CREATE_EVENT", async () => {
    const port = 9090;
    const server = new WebsocketServer();

    const handler = jest.fn().mockResolvedValue(undefined);
    server.setCreateEventHandler(handler as any);
    server.start(port);

    const client = new WebSocket(`ws://localhost:${port}`);
    await waitForOpen(client);

    client.send(
      JSON.stringify({
        type: "CREATE_EVENT",
        payload: { name: "t", time: Date.now() + 1000 },
      }),
    );

    // wait a short time for handler to be invoked
    await new Promise((r) => setTimeout(r, 100));

    expect(handler).toHaveBeenCalled();

    client.close();
    // close server wss
    try {
      (server as any).wss.close();
    } catch (_) {}
  });

  test("sends only to OPEN clients and skips closed ones", () => {
    const server = new WebsocketServer();

    const openSend = jest.fn();
    const closedSend = jest.fn();

    const openClient = {
      send: openSend,
      readyState: WebSocket.OPEN,
    } as unknown as WebSocket;
    const closedClient = {
      send: closedSend,
      readyState: WebSocket.CLOSED,
    } as unknown as WebSocket;

    // inject a fake wss with a clients Set
    (server as any).wss = {
      clients: new Set([openClient, closedClient]),
    } as any;

    const event: Event = {
      id: "e1",
      name: "evt",
      time: Date.now(),
      isTriggered: false,
    };

    server.notifyAllClients({ type: "EVENTS_TRIGGERED", payload: event });

    expect(openSend).toHaveBeenCalledTimes(1);
    expect(closedSend).not.toHaveBeenCalled();
  });
});
