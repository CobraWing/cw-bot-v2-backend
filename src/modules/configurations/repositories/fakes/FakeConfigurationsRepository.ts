import { uuid } from 'uuidv4';
import IConfigurationsRepository from '@modules/configurations/repositories/IConfigurationsRepository';
import IListConfigurationsDTO from '@modules/configurations/dtos/IListConfigurationsDTO';
import ICreateConfigurationDTO from '@modules/configurations/dtos/ICreateConfigurationDTO';

import Configurations from '../../entities/Configurations';

class ConfigurationsRepository implements IConfigurationsRepository {
  private configurations: Configurations[] = [];

  public async listServerConfigurations({
    server_id,
  }: IListConfigurationsDTO): Promise<Configurations[] | undefined> {
    const configurations = this.configurations.filter(
      config => config.server_id === server_id,
    );

    return configurations;
  }

  public async create({
    server_id,
    key,
    value,
  }: ICreateConfigurationDTO): Promise<Configurations> {
    const configuration = new Configurations();

    Object.assign(configuration, {
      id: uuid(),
      server_id,
      key,
      value,
    });

    this.configurations.push(configuration);

    return configuration;
  }
}

export default ConfigurationsRepository;
