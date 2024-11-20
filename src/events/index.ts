import interactionCreate from "./interactionCreate";
import guildCreate from "./guildCreate";
import { TEventListener } from "../types/events";

const eventListener: Record<string, TEventListener<any>> = {
  interactionCreate,
  guildCreate,
};

export default eventListener;
