/* eslint-disable no-restricted-syntax */
import { injectable, inject } from 'tsyringe';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import IDefaultCommandRepository from '../repositories/IDefaultCommandRepository';
import DefaultCommand from '../entities/DefaultCommand';

interface IRequest {
  id: string;
  discord_id: string;
}

@injectable()
class GetDefaultCommandByIdAndDiscordIdService {
  constructor(
    @inject('DefaultCommandRepository')
    private defaultCommandRepository: IDefaultCommandRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute({ id, discord_id }: IRequest): Promise<DefaultCommand | undefined> {
    const serverExists = await this.serversRepository.findByIdDiscord(discord_id);

    if (!serverExists) {
      log.error(`[GetDefaultCommandByIdAndDiscordIdService] server does not exists with id: ${discord_id}`);
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    const defaultCommand = await this.defaultCommandRepository.findByIdAndServerId(id, serverExists.id);

    if (defaultCommand && defaultCommand.server_default_command) {
      defaultCommand.custom_default_command = defaultCommand.server_default_command.find(
        sdc => sdc.server_id === serverExists.id,
      );
    }

    return defaultCommand;
  }
}

export default GetDefaultCommandByIdAndDiscordIdService;
