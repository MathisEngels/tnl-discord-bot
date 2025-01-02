import mainLogger from "../logger";
import { CreateGuildBody, TGuild, UpdateGuildBody } from "../types/API";

const logger = mainLogger.child({ scope: "API" });

export async function getGuildByDiscordId(discordGuildId: string): Promise<TGuild | null> {
  try {
    logger.debug(`Fetching guild by Discord ID: ${discordGuildId}`);

    const response = await fetch(`${process.env.API_URL}/guilds/${discordGuildId}`);
    const data = await response.json();

    logger.debug(`Successfully fetched guild by Discord ID: ${discordGuildId}`);
    return data;
  } catch (error) {
    logger.error(`Failed to fetch guild by Discord ID: ${discordGuildId}. ${error}`);

    return null;
  }
}

export async function createGuild(body: CreateGuildBody): Promise<boolean> {
  try {
    logger.debug(`Creating guild: ${body.discordGuildId}`);

    await fetch(`${process.env.API_URL}/guilds`, { headers: { "Content-Type": "application/json" }, method: "POST", body: JSON.stringify(body) });

    logger.debug(`Successfully created guild: ${body.discordGuildId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to create guild: ${body.discordGuildId}. ${error}`);

    return false;
  }
}

export async function updateGuild(id: number, body: UpdateGuildBody): Promise<boolean> {
  try {
    logger.debug(`Updating guild: ${id}`);

    await fetch(`${process.env.API_URL}/guilds/${id}`, { headers: { "Content-Type": "application/json" }, method: "PUT", body: JSON.stringify(body) });

    logger.debug(`Successfully updated guild: ${id}`);
    return true;
  } catch (error) {
    logger.error(`Failed to update guild: ${id}. ${error}`);

    return false;
  }
}
