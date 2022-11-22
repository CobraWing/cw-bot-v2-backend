const jobsConfig = {
  tickNotification: {
    cron: process.env.CRON_TICK_NOTIFICATION || '*/5 * * * *', // every 5 minute
    dbPrefix: process.env.CRON_TICK_DB_PREFIX || 'LOCAL',
  },
  galnetNotification: {
    cron: process.env.CRON_GALNET_NOTIFICATION || '*/5 * * * *', // every minute
    defaultCacheExpiration: process.env.CACHE_GALNET_EXPIRATION
      ? parseInt(process.env.CACHE_GALNET_EXPIRATION, 10)
      : 86400, // 1 day in seconds
  },
};

export default jobsConfig;
