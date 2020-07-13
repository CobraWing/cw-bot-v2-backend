const discordBaseUrl = 'https://discord.com/api';
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const clientRedirect = process.env.CLIENT_REDIRECT;
const clientScopes = 'identify guilds';

const authConfig = {
  jwt: {
    secret: process.env.APP_SECRET || 'default',
    expiresIn: '1d',
  },
  discord: {
    authorizeUrl: `${discordBaseUrl}/oauth2/authorize`,
    authorizeParams:
      `client_id=${clientId}&redirect_uri=${clientRedirect}` +
      `&scope=${clientScopes}&response_type=code`,
    tokenUrl: `${discordBaseUrl}/oauth2/token`,
    tokenParams:
      `client_id=${clientId}&redirect_uri=${clientRedirect}` +
      `&scope=${clientScopes}&response_type=code&client_secret=${clientSecret}` +
      `&grant_type=authorization_code`,
  },
};

export default authConfig;
