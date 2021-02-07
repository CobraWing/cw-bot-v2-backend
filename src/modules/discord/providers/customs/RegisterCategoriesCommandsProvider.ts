/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
import { injectable, container } from 'tsyringe';
import Commando from 'discord.js-commando';
import log from 'heroku-logger';

import ClientProvider from '@modules/discord/providers/ClientProvider';
import ListEnabledCategoriesWithEnabledCustomCommandsService from '@modules/categories/services/ListEnabledCategoriesWithEnabledCustomCommandsService';
import CustomCategoryRunner from '@modules/discord/runners/CustomCategoryRunner';

@injectable()
class RegisterCategoriesCommandsProvider {
  public async execute(): Promise<void> {
    log.info('[RegisterCategoriesCommandsProvider] Starting to register categories');

    try {
      const commandoClient = await container.resolve(ClientProvider).getCLient();
      const listEnabledCategoriesWithEnabledCustomCommandsService = container.resolve(
        ListEnabledCategoriesWithEnabledCustomCommandsService,
      );

      const guildEnabledCategories = {};
      const uniqueCategories = new Set();

      for await (const [id] of commandoClient.guilds.cache) {
        const categories = await listEnabledCategoriesWithEnabledCustomCommandsService.execute({
          discord_id: id,
        });

        Object.assign(guildEnabledCategories, {
          ...guildEnabledCategories,
          [id]: categories?.map(category => category.name.toLowerCase()),
        });
      }

      Object.values(guildEnabledCategories).forEach((values: any) => {
        for (const value of values) {
          uniqueCategories.add(value);
        }
      });

      commandoClient.registry.registerGroup('customcategoriesgroup');
      this.unloadCategoriesIfAlreadyRegistered(commandoClient);

      const aliases: string[] = Array.from(uniqueCategories.values()) as string[];

      const categoryRunnerCommand = new CustomCategoryRunner(guildEnabledCategories, commandoClient, {
        name: '@categories',
        group: 'customcategoriesgroup',
        memberName: `customcategories`,
        description: `Custom Categories`,
        guildOnly: true,
        aliases,
      });
      commandoClient.registry.registerCommand(categoryRunnerCommand);

      log.debug('[RegisterCategoriesCommandsProvider] custom categories registered: ', aliases);
      log.info(
        `[RegisterCategoriesCommandsProvider] Finished register custom categories, total of categories alias registered: ${aliases.length}`,
      );
    } catch (err) {
      log.error('Error while register custom categories', [err.message, err.stack]);
    }
  }

  unloadCategoriesIfAlreadyRegistered(commandoClient: Commando.CommandoClient): void {
    const registeredCommand = commandoClient.registry.commands.find(c => c.name === '@categories');
    if (registeredCommand) {
      commandoClient.registry.unregisterCommand(registeredCommand);
    }
  }
}

export default RegisterCategoriesCommandsProvider;
