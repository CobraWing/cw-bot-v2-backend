import IConfigurationsRepository from '@modules/configurations/repositories/IConfigurationsRepository';
import ICreateConfigurationDTO from '@modules/configurations/dtos/ICreateConfigurationDTO';

import Configuration from '../../entities/Configuration';

class ConfigurationsRepository implements IConfigurationsRepository {
  private configurations: Configuration[] = [];

  public async create({
    id,
    value_default,
    value_default_alternative,
  }: ICreateConfigurationDTO): Promise<Configuration> {
    const configuration = new Configuration();

    Object.assign(configuration, {
      id,
      value_default,
      value_default_alternative,
    });

    this.configurations.push(configuration);

    return configuration;
  }
}

export default ConfigurationsRepository;
