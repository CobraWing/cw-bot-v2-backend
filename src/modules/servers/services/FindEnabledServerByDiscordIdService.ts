import { injectable, inject, delay } from 'tsyringe';

import IServersRepository from '../repositories/IServersRepository';
import Server from '../entities/Server';
import ServersRepository from '../repositories/typeorm/ServersRepository';

interface IRequest {
  discord_id: string;
}

@injectable()
class FindEnabledServerByDiscordIdService {
  constructor(
    @inject(delay(() => ServersRepository))
    private serversRepository: IServersRepository,
  ) {}

  public async execute({ discord_id }: IRequest): Promise<Server | undefined> {
    const server = await this.serversRepository.findByIdDiscordAndEnabledServer(discord_id);
    return server;
  }
}

export default FindEnabledServerByDiscordIdService;
