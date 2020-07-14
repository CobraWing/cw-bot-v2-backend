import AppError from '@shared/errors/AppError';
import FakeCategoriesRepository from '../repositories/fakes/FakeCategoriesRepository';
import FakeServersRepository from '../../servers/repositories/fakes/FakeServersRepository';
import ListCategoriesService from './ListCategoriesService';

let fakeCategoriesRepository: FakeCategoriesRepository;
let fakeServersRepository: FakeServersRepository;
let listCategoriesService: ListCategoriesService;
describe('ListCategoriesService', () => {
  beforeEach(() => {
    fakeCategoriesRepository = new FakeCategoriesRepository();
    fakeServersRepository = new FakeServersRepository();

    listCategoriesService = new ListCategoriesService(
      fakeCategoriesRepository,
      fakeServersRepository,
    );
  });
  it('should be able to list categories in a server', async () => {
    const server = await fakeServersRepository.create({
      id_discord: 'server-id',
      name: 'sever-name',
    });

    const category1 = await fakeCategoriesRepository.create({
      server_id: server.id,
      name: 'category_1',
      description: 'description',
      show_in_menu: true,
    });

    const category2 = await fakeCategoriesRepository.create({
      server_id: server.id,
      name: 'category_2',
      description: 'description',
      show_in_menu: true,
    });

    const categories = await listCategoriesService.execute({
      server_id: server.id,
    });

    expect(categories).toEqual(expect.arrayContaining([category1, category2]));
  });

  it('should return a empty list when server does not contains categories', async () => {
    const server = await fakeServersRepository.create({
      id_discord: 'server-id',
      name: 'sever-name',
    });

    const categories = await listCategoriesService.execute({
      server_id: server.id,
    });

    expect(categories).toEqual([]);
  });

  it('should not be able to list categories when server does not exists', async () => {
    const server = await fakeServersRepository.create({
      id_discord: 'server-id',
      name: 'sever-name',
    });

    await fakeCategoriesRepository.create({
      server_id: server.id,
      name: 'category_1',
      description: 'description',
      show_in_menu: true,
    });

    await fakeCategoriesRepository.create({
      server_id: server.id,
      name: 'category_2',
      description: 'description',
      show_in_menu: true,
    });

    await expect(
      listCategoriesService.execute({
        server_id: 'server-not-exists',
      }),
    ).rejects.toEqual(new AppError('Server does not exists'));
  });
});