import CommandCategory from '../entities/CommandCategory';
import ICreateCategoryDTO from '../dtos/ICreateCategoryDTO';

export default interface ICategoriesRepository {
  create(data: ICreateCategoryDTO): Promise<CommandCategory>;
}
