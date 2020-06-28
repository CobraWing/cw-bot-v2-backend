import Server from '../entities/Server';
import ICreateServerDTO from '../dtos/ICreateServerDTO';

export default interface ICategoriesRepository {
  create(data: ICreateServerDTO): Promise<Server>;
}
