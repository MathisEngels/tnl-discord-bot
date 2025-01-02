import mainLogger from "../logger";
import { CreatePlayerBody, Player, UpdatePlayerBody } from "../types/API";

const logger = mainLogger.child({ scope: "API" });

export async function getPlayerByDiscordId(discordId: string): Promise<Player | null> {
  try {
    logger.debug(`Fetching player by Discord ID: ${discordId}`);

    const response = await fetch(`${process.env.API_URL}/players/dc/${discordId}`);
    const data = await response.json();

    logger.debug(`Successfully fetched player by Discord ID: ${discordId}`);
    return data;
  } catch (error) {
    logger.error(`Failed to fetch player by Discord ID: ${discordId}. ${error}`);

    return null;
  }
}

export async function createPlayer(body: CreatePlayerBody): Promise<boolean> {
  try {
    logger.debug(`Creating player: ${body.discordId}`);

    const response = await fetch(`${process.env.API_URL}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    logger.debug(`Successfully created player: ${body.discordId}`);
    return response.ok;
  } catch (error) {
    logger.error(`Failed to create player: ${body.discordId}. ${error}`);

    return false;
  }
}

export async function updatePlayer(discordId: string, body: UpdatePlayerBody): Promise<boolean> {
  try {
    logger.debug(`Updating player: ${discordId}`);

    const response = await fetch(`${process.env.API_URL}/players/${discordId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    logger.debug(`Successfully updated player: ${discordId}`);
    return response.ok;
  } catch (error) {
    logger.error(`Failed to update player: ${discordId}. ${error}`);

    return false;
  }
}
