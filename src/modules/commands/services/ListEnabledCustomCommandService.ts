import { injectable, inject } from 'tsyringe';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import ICustomCommandRepository from '../repositories/ICustomCommandRepository';
import IServersRepository from '../../servers/repositories/IServersRepository';
import CustomCommand from '../entities/CustomCommand';

interface IRequest {
  discord_id: string;
}

@injectable()
class ListEnabledCustomCommandService {
  constructor(
    @inject('CustomCommandRepository')
    private customCommandRepository: ICustomCommandRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute({
    discord_id,
  }: IRequest): Promise<CustomCommand[] | undefined> {
    const serverEnabled = await this.serversRepository.findByIdDiscordAndEnabledServer(
      discord_id,
    );

    if (!serverEnabled) {
      log.warn(
        `[ListEnabledCustomCommandService] server id: ${discord_id} is not enabled`,
      );
      throw new AppError('Server does not exists');
    }

    const customCommands = await this.customCommandRepository.listEnabledByServerId(
      serverEnabled.id,
    );

    // if (customCommands) {
    //   customCommands.sort((a, b) => (a.name > b.name ? 1 : -1));
    // }

    return customCommands;
  }
}

export default ListEnabledCustomCommandService;
