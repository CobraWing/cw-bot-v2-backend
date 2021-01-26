import { injectable, container } from 'tsyringe';
import { CronJob } from 'cron';

import log from 'heroku-logger';
import CheckLastTickAndNotifyServersService from '@modules/jobs/services/CheckLastTickAndNotifyServersService';

@injectable()
class TickNotificationRunner {
  public async execute(): Promise<void> {
    log.info('[TickNotificationRunner] Starting register job');

    try {
      const job = new CronJob(
        '*/5 * * * *', // every 5 minute
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
