import { getRepository, Repository } from 'typeorm';

import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICreateServerDTO from '@modules/servers/dtos/ICreateServerDTO';

import Server from '../../entities/Server';

class ServersRepository implements IServersRepository {
  private ormRepository: Repository<Server>;

  constructor() {
    this.ormRepository = getRepository(Server);
  }

  public async create({ name, id_discord }: ICreateServerDTO): Promise<Server> {
    const server = this.ormRepository.create({
      name,
      id_discord,
      enabled: true,
    });

    await this.ormRepository.save(server);

    return server;
  }
}

export default ServersRepository;
