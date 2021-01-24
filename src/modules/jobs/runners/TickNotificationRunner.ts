import { injectable, container } from 'tsyringe';
import { CronJob } from 'cron';

import log from 'heroku-logger';
import ClientProvider from '@modules/discord/providers/ClientProvider';
import CheckLastTickAndNotifyServersService from '@modules/jobs/services/CheckLastTickAndNotifyServersService';

@injectable()
class TickNotificationRunner {
  private clientProvider: ClientProvider;

  private checkLastTickAndNotifyServersService: CheckLastTickAndNotifyServersService;

  constructor() {
    this.clientProvider = container.resolve(ClientProvider);
    this.checkLastTickAndNotifyServersService = container.resolve(CheckLastTickAndNotifyServersService);
  }

  public async execute(): Promise<void> {
    log.info('[TickNotificationRunner] Starting register job');

    try {
      const job = new CronJob(
        '* * * * *', // every minute
        () => {
          this.checkLastTickAndNotifyServersService.execute();
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
