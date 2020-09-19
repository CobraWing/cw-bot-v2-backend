import AppError from '@shared/errors/AppError';
import FakeServersRepository from '@modules/servers/repositories/fakes/FakeServersRepository';
import FakeCategoriesRepository from '../repositories/fakes/FakeCategoriesRepository';
import CreateCategoryService from './CreateCategoryService';

let fakeCategoriesRepository: FakeCategoriesRepository;
let fakeServersRepository: FakeServersRepository;
let createCategoryService: CreateCategoryService;
describe('CreateCategoryService', () => {
  beforeEach(() => {
    fakeCategoriesRepository = new FakeCategoriesRepository();
    fakeServersRepository = new FakeServersRepository();

    createCategoryService = new CreateCategoryService(
      fakeCategoriesRepository,
      fakeServersRepository,
    );
  });
  it('should be able to create a new category in a server', async () => {
    await fakeServersRepository.create({
      name: 'fakeServer',
      id_discord: '123456',
      enabled: true,
    });

    const category = await createCategoryService.execute({
      discordId: '123456',
      name: 'category1',
      description: 'description',
      enabled: true,
      show_in_menu: true,
      updated_by: 'user-test',
    });

    expect(category).toHaveProperty('id');
  });

  it('should not be able to create category with same name in a server', async () => {
    await fakeServersRepository.create({
      name: 'same_server',
      id_discord: 'same_server',
      enabled: true,
    });

    await createCategoryService.execute({
      discordId: 'same_server',
      name: 'same_name',
      description: 'description 1',
      enabled: true,
      show_in_menu: true,
      updated_by: 'user-test',
    });

    await expect(
      createCategoryService.execute({
        discordId: 'same_server',
        name: 'same_name',
        description: 'description 2',
        enabled: true,
        show_in_menu: true,
        updated_by: 'user-test',
      }),
    ).rejects.toEqual(
      new AppError({
        message: 'Category already registered.',
        statusCode: 409,
        message_ptbr: 'Já existe uma categoria com esse nome.',
      }),
    );
  });

  it('should be able to create category with same name in different servers', async () => {
    await fakeServersRepository.create({
      name: 'server_1',
      id_discord: 'server_1',
      enabled: true,
    });

    await fakeServersRepository.create({
      name: 'server_2',
      id_discord: 'server_2',
      enabled: true,
    });

    const category_server_1 = await createCategoryService.execute({
      discordId: 'server_1',
      name: 'same_name',
      description: 'description 1',
      enabled: true,
      show_in_menu: true,
      updated_by: 'user-test',
    });

    const category_server_2 = await createCategoryService.execute({
      discordId: 'server_2',
      name: 'same_name',
      description: 'description 2',
      enabled: true,
      show_in_menu: true,
      updated_by: 'user-test',
    });

    expect(category_server_1).toHaveProperty('id');
    expect(category_server_2).toHaveProperty('id');
  });
});
