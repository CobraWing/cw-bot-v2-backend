import { injectable, container } from 'tsyringe';
import { CronJob } from 'cron';

import log from 'heroku-logger';
import CheckLastTickAndNotifyServersService from '@modules/jobs/services/CheckLastTickAndNotifyServersService';
import jobsConfig from '@config/jobsConfig';

@injectable()
class TickNotificationRunner {
  public async execute(): Promise<void> {
    log.info('[TickNotificationRunner] Starting register job');

    try {
      const job = new CronJob(
        jobsConfig.tickNotification.cron,
        () => {
          container.resolve(CheckLastTickAndNotifyServersService).execute();
        },
        null,
      );
      job.start();
    } catch (e) {
      log.error('[TickNotificationRunner] Error while registering', e);
    }
  }
}

export default TickNotificationRunner;
