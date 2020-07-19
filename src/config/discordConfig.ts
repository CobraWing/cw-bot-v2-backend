const discordConfig = {
  api: {
    baseApiUrl: 'https://discord.com/api',
    baseCDNUrl: 'https://cdn.discordapp.com',
  },
  authentication: {
    botToken: process.env.DISCORD_BOT_TOKEN,
  },
};

export default discordConfig;
