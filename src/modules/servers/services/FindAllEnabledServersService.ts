import { injectable, inject, delay } from 'tsyringe';

import IServersRepository from '../repositories/IServersRepository';
import Server from '../entities/Server';
import ServersRepository from '../repositories/typeorm/ServersRepository';

@injectable()
class FindAllEnabledServersService {
  constructor(
    @inject(delay(() => ServersRepository))
    private serversRepository: IServersRepository,
  ) {}

  public async execute(): Promise<Server[] | undefined> {
    const servers = await this.serversRepository.findAll(true);

    return servers;
  }
}

export default FindAllEnabledServersService;
