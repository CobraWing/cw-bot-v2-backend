declare namespace Express {
  export interface Request {
    user: {
      discordId: string;
    };
    guild: {
      discordId: string;
    };
  }
}
