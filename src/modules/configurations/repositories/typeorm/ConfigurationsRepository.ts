import { getRepository, Repository } from 'typeorm';

import IConfigurationsRepository from '@modules/configurations/repositories/IConfigurationsRepository';
import IConfigurationsDTO from '@modules/configurations/dtos/IConfigurationsDTO';

import Configurations from '../../entities/Configurations';

class ConfigurationsRepository implements IConfigurationsRepository {
  private ormRepository: Repository<Configurations>;

  constructor() {
    this.ormRepository = getRepository(Configurations);
  }

  public async listServerConfigurations({
    server_id,
  }: IConfigurationsDTO): Promise<Configurations[] | undefined> {
    const configurations = await this.ormRepository.find({
      where: { server_id },
    });

    return configurations;
  }
}

export default ConfigurationsRepository;
