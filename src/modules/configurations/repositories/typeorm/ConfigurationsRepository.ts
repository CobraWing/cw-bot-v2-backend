import { getRepository, Repository } from 'typeorm';

import IConfigurationsRepository from '@modules/configurations/repositories/IConfigurationsRepository';
import IListConfigurationsDTO from '@modules/configurations/dtos/IListConfigurationsDTO';
import ICreateConfigurationDTO from '@modules/configurations/dtos/ICreateConfigurationDTO';

import Configurations from '../../entities/Configurations';

class ConfigurationsRepository implements IConfigurationsRepository {
  private ormRepository: Repository<Configurations>;

  constructor() {
    this.ormRepository = getRepository(Configurations);
  }

  public async listServerConfigurations({
    server_id,
  }: IListConfigurationsDTO): Promise<Configurations[] | undefined> {
    const configurations = await this.ormRepository.find({
      where: { server_id },
    });

    return configurations;
  }

  public async create({
    server_id,
    key,
    value,
    updated_by,
  }: ICreateConfigurationDTO): Promise<Configurations> {
    const configuration = this.ormRepository.create({
      server_id,
      key,
      value,
      updated_by,
    });

    await this.ormRepository.save(configuration);

    return configuration;
  }
}

export default ConfigurationsRepository;
