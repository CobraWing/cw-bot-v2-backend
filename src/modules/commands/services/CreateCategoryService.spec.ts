import AppError from '@shared/errors/AppError';
import FakeCategoriesRepository from '../repositories/fakes/FakeCategoriesRepository';
import CreateCategoryService from './CreateCategoryService';

let fakeCategoriesRepository: FakeCategoriesRepository;
let createCategoryService: CreateCategoryService;
describe('CreateCategoryService', () => {
  beforeEach(() => {
    fakeCategoriesRepository = new FakeCategoriesRepository();

    createCategoryService = new CreateCategoryService(fakeCategoriesRepository);
  });
  it('should be able to create a new category in a server', async () => {
    const category = await createCategoryService.execute({
      server_id: '123456',
      name: 'category1',
      description: 'description',
      show_in_menu: true,
    });

    expect(category).toHaveProperty('id');
  });

  it('should not be able to create category with same name in a server', async () => {
    await createCategoryService.execute({
      server_id: 'same_server',
      name: 'same_name',
      description: 'description 1',
      show_in_menu: true,
    });

    await expect(
      createCategoryService.execute({
        server_id: 'same_server',
        name: 'same_name',
        description: 'description 2',
        show_in_menu: true,
      }),
    ).rejects.toEqual(new AppError('Category already registered'));
  });

  it('should be able to create category with same name in different servers', async () => {
    const category_server_1 = await createCategoryService.execute({
      server_id: 'server_1',
      name: 'same_name',
      description: 'description 1',
      show_in_menu: true,
    });

    const category_server_2 = await createCategoryService.execute({
      server_id: 'server_2',
      name: 'same_name',
      description: 'description 2',
      show_in_menu: true,
    });

    expect(category_server_1).toHaveProperty('id');
    expect(category_server_2).toHaveProperty('id');
  });
});
