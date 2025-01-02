import { Client, ClientOptions, Collection } from "discord.js";
import BaseCommand from "./BaseCommand";
import commands from "../commands";
import events from "../events";
import SaurollScheduler from "./SaurollScheduler";
import Sauroll from "./Sauroll";
import logger from "../logger";

export default class ExtendedClient extends Client {
  public commands: Collection<string, BaseCommand>;
  public sauroll = new Sauroll(this);

  constructor(options: ClientOptions) {
    super(options);
    logger.debug("Client initializing...");

    this.commands = new Collection();
    this.registerCommands();

    this.registerEventHandler();

    logger.debug("Client initialized.");
  }

  private async registerCommands() {
    logger.debug(`Registering ${Object.keys(commands).length} commands.`);

    for (const command of Object.values(commands)) {
      this.commands.set(command.data.name, command);
    }

    logger.debug("Commands registered.");
  }

  private registerEventHandler() {
    logger.debug(`Registering ${Object.keys(events).length} event handlers.`);

    for (const eventHandler of Object.values(events)) {
      if (eventHandler.once) {
        this.once(eventHandler.name, eventHandler.execute);
      } else {
        this.on(eventHandler.name, eventHandler.execute);
      }
    }

    logger.debug("Event handlers registered.");
  }

  public setSaurollHandlers() {
    logger.debug("Setting Sauroll handlers.");

    const ping = () => {
      this.sauroll.ping();
    };

    const roll = (chestNumber: number) => {
      this.sauroll.resetPassPlayers();

      this.sauroll.postRoll(chestNumber);

      if (chestNumber === 6) {
        setTimeout(async () => {
          await this.sauroll.deleteMessages();
          this.sauroll.reset();
        }, 5 * 60 * 1000);
      }
    };

    new SaurollScheduler(ping, roll);

    logger.debug("Sauroll handlers set.");
  }
}
