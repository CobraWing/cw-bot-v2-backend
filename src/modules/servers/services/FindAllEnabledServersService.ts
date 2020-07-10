import { injectable, inject } from 'tsyringe';

import IServersRepository from '../repositories/IServersRepository';
import Server from '../entities/Server';

@injectable()
class FindAllEnabledServersService {
  constructor(
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute(): Promise<Server[] | undefined> {
    const servers = await this.serversRepository.findAll(true);

    return servers;
  }
}

export default FindAllEnabledServersService;
