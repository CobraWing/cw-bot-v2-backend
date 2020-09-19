import { injectable, inject } from 'tsyringe';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import ICustomCommandRepository from '../repositories/ICustomCommandRepository';
import IServersRepository from '../../servers/repositories/IServersRepository';
import CustomCommand from '../entities/CustomCommand';

interface IRequest {
  discord_id: string;
  name: string;
}

@injectable()
class GetCustomCommandByNameService {
  constructor(
    @inject('CustomCommandRepository')
    private customCommandRepository: ICustomCommandRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute({
    discord_id,
    name,
  }: IRequest): Promise<CustomCommand | undefined> {
    const serverEnabled = await this.serversRepository.findByIdDiscordAndEnabledServer(
      discord_id,
    );

    if (!serverEnabled) {
      log.error(
        `[GetCustomCommandByNameService] server id: ${discord_id} is not enabled`,
      );
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    const customCommandFound = await this.customCommandRepository.findByNameAndServerId(
      name,
      serverEnabled.id,
    );

    return customCommandFound;
  }
}

export default GetCustomCommandByNameService;
