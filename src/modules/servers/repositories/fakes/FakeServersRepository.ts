import { uuid } from 'uuidv4';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICreateServerDTO from '@modules/servers/dtos/ICreateServerDTO';

import Server from '../../entities/Server';

class FakeServersRepository implements IServersRepository {
  private servers: Server[] = [];

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
}

export default FakeServersRepository;
