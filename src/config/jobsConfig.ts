const jobsConfig = {
  tickNotification: {
    cron: process.env.CRON_TICK_NOTIFICATION || '*/5 * * * *', // every 5 minute
  },
  galnetNotification: {
    cron: process.env.CRON_GALNET_NOTIFICATION || '*/5 * * * *', // every minute
  },
};

export default jobsConfig;
