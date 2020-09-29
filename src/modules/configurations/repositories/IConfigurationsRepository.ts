import Configuration from '../entities/Configuration';
// import IListConfigurationsDTO from '../dtos/IListConfigurationsDTO';
import ICreateConfigurationDTO from '../dtos/ICreateConfigurationDTO';

export default interface IConfigurationsRepository {
  // listServerConfigurations(
  //   data: IListConfigurationsDTO,
  // ): Promise<Configuration[] | undefined>;

  create(data: ICreateConfigurationDTO): Promise<Configuration>;
}
