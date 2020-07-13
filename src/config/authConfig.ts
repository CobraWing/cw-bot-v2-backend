const discordBaseUrl = 'https://discord.com/api/oauth2';

export default {
  discord: {
    authorizeUrl: `${discordBaseUrl}/authorize`,
    tokenUrl: `${discordBaseUrl}/token`,
    oauth: {
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      clientRedirect: process.env.CLIENT_REDIRECT,
      clientScopes: 'identify guilds',
    },
  },
};
