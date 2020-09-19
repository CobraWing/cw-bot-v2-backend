import { injectable, inject, container } from 'tsyringe';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import RegisterCustomCommandsProvider from '@modules/discord/providers/RegisterCustomCommandsProvider';
import ICustomCommandRepository from '../repositories/ICustomCommandRepository';
import IServersRepository from '../../servers/repositories/IServersRepository';

interface IRequest {
  discord_id: string;
  id: string;
}

@injectable()
class DeleteCustomCommandByIdService {
  private registerCustomCommandsProvider: RegisterCustomCommandsProvider;

  constructor(
    @inject('CustomCommandRepository')
    private customCommandRepository: ICustomCommandRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {
    this.registerCustomCommandsProvider = container.resolve(
      RegisterCustomCommandsProvider,
    );
  }

  public async execute({ id, discord_id }: IRequest): Promise<void> {
    const serverExists = await this.serversRepository.findByIdDiscord(
      discord_id,
    );

    if (!serverExists) {
      log.error(
        `[DeleteCustomCommandByIdService] server does not exists with id: ${discord_id}`,
      );
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    await this.customCommandRepository.deleteByIdAndServerId(
      id,
      serverExists.id,
    );

    this.registerCustomCommandsProvider.execute();
  }
}

export default DeleteCustomCommandByIdService;
