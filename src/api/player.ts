import { CreatePlayerBody, Player, UpdatePlayerBody } from "../types/API";

export async function getPlayerByDiscordId(discordId: string): Promise<Player | null> {
  try {
    const response = await fetch(`${process.env.API_URL}/players/dc/${discordId}`);
    const data = await response.json()

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createPlayer(body: CreatePlayerBody): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.API_URL}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updatePlayer(discordId: string, body: UpdatePlayerBody): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.API_URL}/players/${discordId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}
