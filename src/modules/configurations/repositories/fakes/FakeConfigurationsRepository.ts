import { uuid } from 'uuidv4';
import IConfigurationsRepository from '@modules/configurations/repositories/IConfigurationsRepository';
import IListConfigurationsDTO from '@modules/configurations/dtos/IListConfigurationsDTO';
import IFindServerConfigurationByKeyDTO from '@modules/configurations/dtos/IFindServerConfigurationByKeyDTO';
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

  public async findServerConfigurationByKey({
    server_id,
    key,
  }: IFindServerConfigurationByKeyDTO): Promise<Configurations | undefined> {
    const configuration = this.configurations.find(
      config => config.server_id === key,
    );

    return configuration;
  }

  public async create({
    server_id,
    key,
    value,
    updated_by,
  }: ICreateConfigurationDTO): Promise<Configurations> {
    const configuration = new Configurations();

    Object.assign(configuration, {
      id: uuid(),
      server_id,
      key,
      value,
      updated_by,
    });

    this.configurations.push(configuration);

    return configuration;
  }
}

export default ConfigurationsRepository;
