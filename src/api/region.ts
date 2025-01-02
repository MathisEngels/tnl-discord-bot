import mainLogger from "../logger";
import { GetAllRegionResponse, GetServersByRegionIdResponse } from "../types/API";

const logger = mainLogger.child({ scope: "API" });

export async function getAllRegions(): Promise<GetAllRegionResponse> {
  try {
    logger.debug(`Fetching all regions`);

    const response = await fetch(`${process.env.API_URL}/regions`);
    const data = await response.json();

    logger.debug(`Successfully fetched all regions`);
    return data;
  } catch (error) {
    logger.error(`Failed to fetch all regions: ${error}`);

    return [];
  }
}

export async function getServersByRegionId(regionId: string): Promise<GetServersByRegionIdResponse> {
  try {
    logger.debug(`Fetching servers by region ID: ${regionId}`);

    const response = await fetch(`${process.env.API_URL}/regions/${regionId}/servers`);
    const data = await response.json();

    logger.debug(`Successfully fetched servers by region ID: ${regionId}`);
    return data;
  } catch (error) {
    logger.error(`Failed to fetch servers by region ID: ${regionId}. ${error}`);

    return [];
  }
}
