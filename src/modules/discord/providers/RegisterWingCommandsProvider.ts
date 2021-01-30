import { injectable, container } from 'tsyringe';

import log from 'heroku-logger';
import ClientProvider from '@modules/discord/providers/ClientProvider';
import WingStatusRunner from '@modules/discord/runners/WingStatusRunner';

@injectable()
class RegisterWingCommandsProvider {
  public static groupName = 'wingcommands';

  public async execute(): Promise<void> {
    log.info('[RegisterWingCommandsProvider] Starting to register wing commands');

    try {
      const commandoClient = await container.resolve(ClientProvider).getCLient();

      commandoClient.registry.registerGroup(RegisterWingCommandsProvider.groupName);

      commandoClient.registry.registerCommands([new WingStatusRunner(commandoClient)]);

      log.info('[RegisterWingCommandsProvider] Finished register wing commands');
    } catch (e) {
      log.error('Error while register wing commands', e);
    }
  }
}

export default RegisterWingCommandsProvider;
