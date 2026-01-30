import WebSocket from "ws";
import { WebsocketServer } from "../../../src/websocket/websocketServer";

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
});
