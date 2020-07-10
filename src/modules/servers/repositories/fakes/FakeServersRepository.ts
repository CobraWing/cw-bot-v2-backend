import { uuid } from 'uuidv4';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICreateServerDTO from '@modules/servers/dtos/ICreateServerDTO';

import Server from '../../entities/Server';

class FakeServersRepository implements IServersRepository {
  private servers: Server[] = [];

  public async findByIdDiscord(
    id_discord: string,
  ): Promise<Server | undefined> {
    const server = this.servers.find(s => s.id_discord === id_discord);

    return server;
  }

  public async create({ name, id_discord }: ICreateServerDTO): Promise<Server> {
    const server = new Server();

    Object.assign(server, {
      id: uuid(),
      name,
      id_discord,
      enabled: true,
    });

    this.servers.push(server);

    return server;
  }

  public async findByServerId(server_id: string): Promise<Server | undefined> {
    const server = this.servers.find(s => s.id === server_id);

    return server;
  }
}

export default FakeServersRepository;
