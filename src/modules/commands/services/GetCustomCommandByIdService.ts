import { injectable, inject } from 'tsyringe';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import ICustomCommandRepository from '../repositories/ICustomCommandRepository';
import IServersRepository from '../../servers/repositories/IServersRepository';
import CustomCommand from '../entities/CustomCommand';

interface IRequest {
  discord_id: string;
  id: string;
}

@injectable()
class GetCustomCommandByIdService {
  constructor(
    @inject('CustomCommandRepository')
    private customCommandRepository: ICustomCommandRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute({
    discord_id,
    id,
  }: IRequest): Promise<CustomCommand | undefined> {
    const serverExists = await this.serversRepository.findByIdDiscord(
      discord_id,
    );

    if (!serverExists) {
      log.error(
        `[GetCustomCommandByIdService] server does not exists with id: ${discord_id}`,
      );
      throw new AppError('Server does not exists');
    }

    const category = await this.customCommandRepository.findByIdAndServerId(
      id,
      serverExists.id,
    );

    return category;
  }
}

export default GetCustomCommandByIdService;
