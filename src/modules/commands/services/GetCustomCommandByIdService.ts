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
  id: string;
}

@injectable()
class GetCustomCommandByIdService {
  constructor(
    @inject(delay(() => CustomCommandRepository))
    private customCommandRepository: ICustomCommandRepository,
    @inject(delay(() => ServersRepository))
    private serversRepository: IServersRepository,
  ) {}

  public async execute({ discord_id, id }: IRequest): Promise<CustomCommand | undefined> {
    const serverExists = await this.serversRepository.findByIdDiscord(discord_id);

    if (!serverExists) {
      log.error(`[GetCustomCommandByIdService] server does not exists with id: ${discord_id}`);
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    const customCommandFound = await this.customCommandRepository.findByIdAndServerId(id, serverExists.id);

    return customCommandFound;
  }
}

export default GetCustomCommandByIdService;
