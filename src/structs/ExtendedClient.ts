import { Client, ClientOptions, Collection } from "discord.js";
import BaseCommand from "./BaseCommand";
import commands from "../commands";
import events from "../events";
import SaurollScheduler from "./SaurollScheduler";
import Sauroll from "./Sauroll";

export default class ExtendedClient extends Client {
  public commands: Collection<string, BaseCommand>;
  public sauroll = new Sauroll(this);

  constructor(options: ClientOptions) {
    super(options);

    this.commands = new Collection();
    this.registerCommands();

    this.registerEventHandler();
  }

  private async registerCommands() {
    for (const command of Object.values(commands)) {
      this.commands.set(command.data.name, command);
    }
  }

  private registerEventHandler() {
    for (const eventHandler of Object.values(events)) {
      if (eventHandler.once) {
        this.once(eventHandler.name, eventHandler.execute);
      } else {
        this.on(eventHandler.name, eventHandler.execute);
      }
    }
  }

  public setSaurollHandlers() {
    const ping = () => {
      this.sauroll.ping();
    };

    const roll = (chestNumber: number) => {
      this.sauroll.resetPassPlayers();

      this.sauroll.postRoll(chestNumber);

      if (chestNumber === 6) {
        setTimeout(() => {
          this.sauroll.deleteMessages();
          this.sauroll.reset();
        }, 5 * 60 * 1000);
      }
    };

    new SaurollScheduler(ping, roll);
  }
}
