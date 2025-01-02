import mainLogger from "../logger";
import { CreateSaurollSubscriptionBody, GetSaurollSubscribersResponse, GetSaurollSubscriptionByGuildIdResponse, UpdateSaurollSubscriptionBody } from "../types/API";

const logger = mainLogger.child({ scope: "API" });

export async function getSaurollSubscribers(): Promise<GetSaurollSubscribersResponse> {
  try {
    logger.debug(`Fetching all sauroll subscriptions`);

    const response = await fetch(`${process.env.API_URL}/sauroll`);
    const data = await response.json();

    logger.debug(`Successfully fetched all sauroll subscriptions`);
    return data;
  } catch (error) {
    logger.error(`Failed to fetch all sauroll subscriptions: ${error}`);

    return [];
  }
}

export async function getSaurollSubscriptionsByDiscordGuildId(discordGuildId: string): Promise<GetSaurollSubscriptionByGuildIdResponse> {
  try {
    logger.debug(`Fetching sauroll subscriptions by Discord guild ID: ${discordGuildId}`);

    const response = await fetch(`${process.env.API_URL}/sauroll/${discordGuildId}`);
    const data = await response.json();

    logger.debug(`Successfully fetched sauroll subscriptions by Discord guild ID: ${discordGuildId}`);
    return data;
  } catch (error) {
    logger.error(`Failed to fetch sauroll subscriptions by Discord guild ID: ${discordGuildId}. ${error}`);

    return [];
  }
}

export async function createSaurollSubscription(data: CreateSaurollSubscriptionBody): Promise<boolean> {
  try {
    logger.debug(`Creating sauroll subscription: ${data.discordVoiceChannelId}`);

    const response = await fetch(`${process.env.API_URL}/sauroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    logger.debug(`Successfully created sauroll subscription: ${data.discordVoiceChannelId}`);
    return response.ok;
  } catch (error) {
    logger.error(`Failed to create sauroll subscription: ${data.discordVoiceChannelId}. ${error}`);

    return false;
  }
}

export async function updateSaurollSubscription(discordVoiceChannelId: string, data: UpdateSaurollSubscriptionBody): Promise<boolean> {
  try {
    logger.debug(`Updating sauroll subscription: ${discordVoiceChannelId}`);

    const response = await fetch(`${process.env.API_URL}/sauroll/${discordVoiceChannelId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    logger.debug(`Successfully updated sauroll subscription: ${discordVoiceChannelId}`);
    return response.ok;
  } catch (error) {
    logger.error(`Failed to update sauroll subscription: ${discordVoiceChannelId}. ${error}`);

    return false;
  }
}

export async function deleteSaurollSubscription(discordVoiceChannelId: string): Promise<boolean> {
  try {
    logger.debug(`Deleting sauroll subscription: ${discordVoiceChannelId}`);
    const response = await fetch(`${process.env.API_URL}/sauroll/${discordVoiceChannelId}`, {
      method: "DELETE",
    });

    logger.debug(`Successfully deleted sauroll subscription: ${discordVoiceChannelId}`);
    return response.ok;
  } catch (error) {
    logger.error(`Failed to delete sauroll subscription: ${discordVoiceChannelId}. ${error}`);

    return false;
  }
}
