import CustomCommand from '../entities/CustomCommand';
import ICreateCustomCommandDTO from '../dtos/ICreateCustomCommandDTO';

export default interface ICustomCommandRepository {
  create(data: ICreateCustomCommandDTO): Promise<CustomCommand>;
}
