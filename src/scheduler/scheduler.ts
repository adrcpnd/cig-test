import type { Event } from "../domain/event";

type TriggerCallback = (event: Event) => void;

export class Scheduler {
  private timers = new Map<string, NodeJS.Timeout>();

  schedule(event: Event, onTrigger: TriggerCallback): void {
    const delay = event.time - Date.now();
    if (delay <= 0) {
      onTrigger(event);
      return;
    }

    const timer = setTimeout(() => {
      onTrigger(event);
      this.timers.delete(event.id);
    }, delay);

    this.timers.set(event.id, timer);
  }

  cancel(eventId: string): void {
    const timer = this.timers.get(eventId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(eventId);
    }
  }
}
