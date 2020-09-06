import { uuid } from 'uuidv4';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICreateServerDTO from '@modules/servers/dtos/ICreateServerDTO';

import Server from '../../entities/Server';

class FakeServersRepository implements IServersRepository {
  private servers: Server[] = [];

  public async findByIdDiscord(
    id_discord: string,
  ): Promise<Server | undefined> {
    return this.servers.find(s => s.id_discord === id_discord);
  }

  public async findByIdDiscordAndEnabledServer(
    id_discord: string,
  ): Promise<Server | undefined> {
    return this.servers.find(
      s => s.id_discord === id_discord && s.enabled === true,
    );
  }

  public async findByServerId(server_id: string): Promise<Server | undefined> {
    return this.servers.find(s => s.id === server_id);
  }

  public async findAll(enabled: boolean): Promise<Server[] | undefined> {
    return this.servers.filter(s => s.enabled === enabled);
  }

  public async create({
    name,
    id_discord,
    enabled,
  }: ICreateServerDTO): Promise<Server> {
    const server = new Server();

    Object.assign(server, {
      id: uuid(),
      name,
      id_discord,
      enabled,
    });

    this.servers.push(server);

    return server;
  }
}

export default FakeServersRepository;
