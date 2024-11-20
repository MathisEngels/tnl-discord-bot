import { AutocompleteInteraction, ButtonInteraction, CacheType, CommandInteraction, InteractionResponse, Message, SlashCommandBuilder } from "discord.js";

export default abstract class BaseCommand {
  public static data: SlashCommandBuilder;
  abstract autocomplete?(interaction: AutocompleteInteraction): void | Promise<void | InteractionResponse<boolean>>;
  abstract execute(interaction: CommandInteraction): Promise<void | InteractionResponse<boolean> | Message<boolean> | ButtonInteraction<CacheType> | undefined>;
}
