import { Scheduler } from "../../../src/scheduler/scheduler";
import type { Event } from "../../../src/domain/event";

describe("Scheduler", () => {
  describe("schedule", () => {
    test("triggers immediate events synchronously", () => {
      const scheduler = new Scheduler();
      const event: Event = {
        id: "e-immediate",
        name: "immediate",
        time: Date.now() - 1000,
        isTriggered: false,
      };

      let triggered = false;
      scheduler.schedule(event, () => {
        triggered = true;
      });

      expect(triggered).toBe(true);
    });

    test("triggers events after a short delay", async () => {
      const scheduler = new Scheduler();
      const event: Event = {
        id: "e-short",
        name: "short-delay",
        time: Date.now() + 50,
        isTriggered: false,
      };

      const triggered = new Promise<Event>((resolve) => {
        scheduler.schedule(event, resolve);
      });

      const ev = await Promise.race([
        triggered,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 1000),
        ),
      ]);

      expect((ev as Event).id).toBe("e-short");
    });
  });
});
