import { injectable, inject, container, delay } from 'tsyringe';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import RegisterCustomsProvider from '@modules/discord/providers/RegisterCustomsProvider';
import ICustomCommandRepository from '../repositories/ICustomCommandRepository';
import IServersRepository from '../../servers/repositories/IServersRepository';
import CustomCommandRepository from '../repositories/typeorm/CustomCommandRepository';
import ServersRepository from '@modules/servers/repositories/typeorm/ServersRepository';

interface IRequest {
  discord_id: string;
  id: string;
}

@injectable()
class DeleteCustomCommandByIdService {
  private registerCustomsProvider: RegisterCustomsProvider;

  constructor(
    @inject(delay(() => CustomCommandRepository))
    private customCommandRepository: ICustomCommandRepository,
    @inject(delay(() => ServersRepository))
    private serversRepository: IServersRepository,
  ) {
    this.registerCustomsProvider = container.resolve(RegisterCustomsProvider);
  }

  public async execute({ id, discord_id }: IRequest): Promise<void> {
    const serverExists = await this.serversRepository.findByIdDiscord(discord_id);

    if (!serverExists) {
      log.error(`[DeleteCustomCommandByIdService] server does not exists with id: ${discord_id}`);
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    await this.customCommandRepository.deleteByIdAndServerId(id, serverExists.id);

    this.registerCustomsProvider.execute();
  }
}

export default DeleteCustomCommandByIdService;
