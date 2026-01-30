import type { Event } from "../domain/event";

export type ClientMessage = {
  type: "CREATE_EVENT";
  payload: {
    name: string;
    time: number;
  };
};

export type ServerMessage = {
  type: "EVENTS_TRIGGERED";
  payload: Event;
};
