/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
import { injectable, container } from 'tsyringe';
import Commando from 'discord.js-commando';
import log from 'heroku-logger';

import ClientProvider from '@modules/discord/providers/ClientProvider';
import ListEnabledCustomCommandService from '@modules/commands/services/ListEnabledCustomCommandService';
import CustomCommandRunner from '@modules/discord/runners/CustomCommandRunner';

@injectable()
class RegisterCustomCommandsProvider {
  public async execute(): Promise<void> {
    log.info('[RegisterCustomCommandsProvider] Starting to register commands');

    try {
      const commandoClient = await container.resolve(ClientProvider).getCLient();
      const listEnabledCustomCommandService = container.resolve(ListEnabledCustomCommandService);

      const guildEnabledCommands = {};
      const uniqueCommands = new Set();

      for await (const [id] of commandoClient.guilds.cache) {
        const commands = await listEnabledCustomCommandService.execute({
          discord_id: id,
        });

        Object.assign(guildEnabledCommands, {
          ...guildEnabledCommands,
          [id]: commands?.map(command => command.name.toLowerCase()),
        });
      }

      Object.values(guildEnabledCommands).forEach((values: any) => {
        for (const value of values) {
          uniqueCommands.add(value);
        }
      });

      commandoClient.registry.registerGroup('customcommandsgroup');
      this.unloadCommandIfAlreadyRegistered(commandoClient);

      const aliases: string[] = Array.from(uniqueCommands.values()) as string[];

      const command = new CustomCommandRunner(guildEnabledCommands, commandoClient, {
        name: '@customcommands',
        group: 'customcommandsgroup',
        memberName: `customcommands`,
        description: `Custom Commands`,
        guildOnly: true,
        aliases,
      });
      commandoClient.registry.registerCommand(command);

      log.debug('[RegisterCustomCommandsProvider] commands registered: ', aliases);
      log.info(
        `[RegisterCustomCommandsProvider] Finished register custom commands, total of commands alias registered: ${aliases.length}`,
      );
    } catch (err) {
      log.error('Error while register custom commands', [err.message, err.stack]);
    }
  }

  unloadCommandIfAlreadyRegistered(commandoClient: Commando.CommandoClient): void {
    const registeredCommand = commandoClient.registry.commands.find(c => c.name === '@customcommands');
    if (registeredCommand) {
      commandoClient.registry.unregisterCommand(registeredCommand);
    }
  }
}

export default RegisterCustomCommandsProvider;
