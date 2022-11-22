import { injectable, inject, delay } from 'tsyringe';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import ICustomCommandRepository from '../repositories/ICustomCommandRepository';
import IServersRepository from '../../servers/repositories/IServersRepository';
import CustomCommand from '../entities/CustomCommand';
import CustomCommandRepository from '../repositories/typeorm/CustomCommandRepository';
import ServersRepository from '@modules/servers/repositories/typeorm/ServersRepository';

interface IRequest {
  discord_id: string;
}

@injectable()
class ListEnabledCustomCommandService {
  constructor(
    @inject(delay(() => CustomCommandRepository))
    private customCommandRepository: ICustomCommandRepository,
    @inject(delay(() => ServersRepository))
    private serversRepository: IServersRepository,
  ) {}

  public async execute({ discord_id }: IRequest): Promise<CustomCommand[] | undefined> {
    const serverEnabled = await this.serversRepository.findByIdDiscordAndEnabledServer(discord_id);

    if (!serverEnabled) {
      log.warn(`[ListEnabledCustomCommandService] server id: ${discord_id} is not enabled`);
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    const customCommands = await this.customCommandRepository.listEnabledByServerId(serverEnabled.id);

    return customCommands;
  }
}

export default ListEnabledCustomCommandService;
