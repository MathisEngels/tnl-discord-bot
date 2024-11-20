import { ClientEvents } from "discord.js";

export type TEventListener<Event extends keyof ClientEvents> = {
  name: Event;
  once?: boolean;
  execute: (...args: ClientEvents[Event]) => void;
};
