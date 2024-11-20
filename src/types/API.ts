type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export type GetAllRegionResponse = Region[];

export type Region = {
  name: string;
  shortname: string;
  id: number;
};

export type CreateGuildBody = Omit<TGuild, "id" | "discordSaurollId">;
export type UpdateGuildBody = Partial<Omit<TGuild, "id">>;

export type Server = {
  id: number;
  name: string;
  regionId: number;
};

export type GetServersByRegionIdResponse = Server[];

export type TGuild = {
  id: number;
  name: string;
  serverId: number;
  discordGuildId: string;
  discordLeaderId: string;
  discordAdvisorIds: string[];
  discordMembersRoleId: string;
  discordSaurollChannelId?: string | null;
  discordSaurollRoleId?: string | null;
};

export type CreatePlayerBody = Omit<Player, "id">;
export type UpdatePlayerBody = Partial<Omit<Player, "id">>;

export type Player = {
  id: number;
  name: string;
  discordId: string;
  cp: number;
  role: string;
  class?: string;
  guildId: number;
  serverId: number;
};

export type SaurollChannelAndRole = {
  id: string;
  discordSaurollChannelId: string;
  discordSaurollRoleId?: string;
}

export type GetSaurollDataResponse = SaurollChannelAndRole[];