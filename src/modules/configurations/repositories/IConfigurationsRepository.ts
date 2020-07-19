import Configurations from '../entities/Configurations';
import IListConfigurationsDTO from '../dtos/IListConfigurationsDTO';
import ICreateConfigurationDTO from '../dtos/ICreateConfigurationDTO';

export default interface IConfigurationsRepository {
  listServerConfigurations(
    data: IListConfigurationsDTO,
  ): Promise<Configurations[] | undefined>;

  create(data: ICreateConfigurationDTO): Promise<Configurations>;
}
