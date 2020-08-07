import { getRepository, Repository } from 'typeorm';

import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICreateServerDTO from '@modules/servers/dtos/ICreateServerDTO';

import Server from '../../entities/Server';

class ServersRepository implements IServersRepository {
  private ormRepository: Repository<Server>;

  constructor() {
    this.ormRepository = getRepository(Server);
  }

  public async findByIdDiscord(
    id_discord: string,
  ): Promise<Server | undefined> {
    const server = await this.ormRepository.findOne({
      where: { id_discord, enabled: true },
      relations: ['configurations'],
    });

    return server;
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

  public async findByServerId(server_id: string): Promise<Server | undefined> {
    const server = await this.ormRepository.findOne({
      where: { id: server_id },
    });

    return server;
  }

  public async findAll(enabled: boolean): Promise<Server[] | undefined> {
    const servers = await this.ormRepository.find({
      where: { enabled },
    });

    return servers;
  }
}

export default ServersRepository;
