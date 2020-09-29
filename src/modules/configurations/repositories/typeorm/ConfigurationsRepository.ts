import { getRepository, Repository } from 'typeorm';

import IConfigurationsRepository from '@modules/configurations/repositories/IConfigurationsRepository';
import ICreateConfigurationDTO from '@modules/configurations/dtos/ICreateConfigurationDTO';

import Configuration from '../../entities/Configuration';

class ConfigurationsRepository implements IConfigurationsRepository {
  private ormRepository: Repository<Configuration>;

  constructor() {
    this.ormRepository = getRepository(Configuration);
  }

  public async create({
    id,
    value_default,
    value_default_alternative,
  }: ICreateConfigurationDTO): Promise<Configuration> {
    const configuration = this.ormRepository.create({
      id,
      value_default,
      value_default_alternative,
    });

    await this.ormRepository.save(configuration);

    return configuration;
  }
}

export default ConfigurationsRepository;
