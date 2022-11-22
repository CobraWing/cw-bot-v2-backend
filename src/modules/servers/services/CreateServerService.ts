import { injectable, inject, delay } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IServersRepository from '../repositories/IServersRepository';
import Server from '../entities/Server';
import ServersRepository from '../repositories/typeorm/ServersRepository';

interface IRequest {
  name: string;
  id_discord: string;
}

@injectable()
class CreateServerService {
  constructor(
    @inject(delay(() => ServersRepository))
    private serversRepository: IServersRepository,
  ) {}

  public async execute({ name, id_discord }: IRequest): Promise<Server> {
    const checkServerExists = await this.serversRepository.findByIdDiscord(id_discord);

    if (checkServerExists) {
      throw new AppError({
        message: 'Server already registered.',
        statusCode: 409,
        message_ptbr: 'Já existe um servidor registrado com esse id.',
      });
    }

    const server = await this.serversRepository.create({
      name,
      id_discord,
      enabled: true,
    });

    return server;
  }
}

export default CreateServerService;
