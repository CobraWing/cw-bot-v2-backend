import { injectable, inject } from 'tsyringe';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import ICustomCommandRepository from '../repositories/ICustomCommandRepository';
import IServersRepository from '../../servers/repositories/IServersRepository';

interface IRequest {
  discord_id: string;
  id: string;
}

@injectable()
class DeleteCustomCommandByIdService {
  constructor(
    @inject('CustomCommandRepository')
    private customCommandRepository: ICustomCommandRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute({ id, discord_id }: IRequest): Promise<void> {
    const serverExists = await this.serversRepository.findByIdDiscord(
      discord_id,
    );

    if (!serverExists) {
      log.error(
        `[DeleteCustomCommandByIdService] server does not exists with id: ${discord_id}`,
      );
      throw new AppError('Server does not exists');
    }

    await this.customCommandRepository.deleteByIdAndServerId(
      id,
      serverExists.id,
    );
  }
}

export default DeleteCustomCommandByIdService;
