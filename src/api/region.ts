import { GetAllRegionResponse, GetServersByRegionIdResponse } from "../types/API";

export async function getAllRegions(): Promise<GetAllRegionResponse> {
  try {
    const response = await fetch(`${process.env.API_URL}/regions`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getServersByRegionId(regionId: string): Promise<GetServersByRegionIdResponse> {
  try {
    const response = await fetch(`${process.env.API_URL}/regions/${regionId}/servers`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
