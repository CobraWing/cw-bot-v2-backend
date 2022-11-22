import { injectable, container } from 'tsyringe';
import { CronJob } from 'cron';

import log from 'heroku-logger';
import CheckLastTickAndNotifyServersService from '@modules/jobs/services/CheckLastTickAndNotifyServersService';
import jobsConfig from '@config/jobsConfig';

@injectable()
class TickNotificationRunner {
  public async execute(): Promise<void> {
    log.info('[TickNotificationRunner] Starting register job');

    const checkLastTickAndNotifyServersService = container.resolve(CheckLastTickAndNotifyServersService);

    try {
      const job = new CronJob(
        jobsConfig.tickNotification.cron,
        () => checkLastTickAndNotifyServersService.execute(),
        null,
      );
      job.start();
    } catch (err) {
      log.error('[TickNotificationRunner] Error while registering', [err.message, err.stack]);
    }
  }
}

export default TickNotificationRunner;
