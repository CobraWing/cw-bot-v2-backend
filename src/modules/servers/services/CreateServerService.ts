import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IServersRepository from '../repositories/IServersRepository';
import Server from '../entities/Server';

interface IRequest {
  name: string;
  id_discord: string;
}

@injectable()
class CreateServerService {
  constructor(
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute({ name, id_discord }: IRequest): Promise<Server> {
    const checkServerExists = await this.serversRepository.findByIdDiscord(
      id_discord,
    );

    if (checkServerExists) {
      throw new AppError('Server already registered');
    }

    const server = await this.serversRepository.create({
      name,
      id_discord,
    });

    return server;
  }
}

export default CreateServerService;
