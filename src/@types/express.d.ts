declare namespace Express {
  export interface Request {
    user: {
      discordId: string;
      name: string;
    };
    guild: {
      discordId: string;
    };
  }
}
