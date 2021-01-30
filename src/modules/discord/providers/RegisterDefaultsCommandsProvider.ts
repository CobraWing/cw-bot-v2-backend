import { injectable, container } from 'tsyringe';

import log from 'heroku-logger';
import ClientProvider from '@modules/discord/providers/ClientProvider';
import HelpCommandRunner from '@modules/discord/runners/HelpCommandRunner';

@injectable()
class RegisterDefaultsCommandsProvider {
  public async execute(): Promise<void> {
    log.info('[RegisterDefaultsCommandsProvider] Starting to register default commands');

    try {
      const commandoClient = await container.resolve(ClientProvider).getCLient();

      commandoClient.registry.registerGroup('defaultcommands');

      commandoClient.registry.registerCommands([new HelpCommandRunner(commandoClient)]);

      log.info('[RegisterDefaultsCommandsProvider] Finished register default commands');
    } catch (e) {
      log.error('Error while register defaults commands', e);
    }
  }
}

export default RegisterDefaultsCommandsProvider;
