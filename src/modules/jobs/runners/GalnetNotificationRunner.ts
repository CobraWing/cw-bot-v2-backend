import { injectable, container } from 'tsyringe';
import { CronJob } from 'cron';

import log from 'heroku-logger';
import CheckDailyGalnetAndNotifyServersService from '@modules/jobs/services/CheckDailyGalnetAndNotifyServersService';
import jobsConfig from '@config/jobsConfig';

@injectable()
class GalnetNotificationRunner {
  public async execute(): Promise<void> {
    log.info('[GalnetNotificationRunner] Starting register job');

    try {
      const job = new CronJob(
        jobsConfig.galnetNotification.cron,
        () => {
          container.resolve(CheckDailyGalnetAndNotifyServersService).execute();
        },
        null,
      );
      job.start();
    } catch (err) {
      log.error('[GalnetNotificationRunner] Error while registering', [err.message, err.stack]);
    }
  }
}

export default GalnetNotificationRunner;
