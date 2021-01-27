const jobsConfig = {
  tickNotification: {
    cron: process.env.CRON_TICK_NOTIFICATION || '*/5 * * * *', // every 5 minute
  },
};

export default jobsConfig;
