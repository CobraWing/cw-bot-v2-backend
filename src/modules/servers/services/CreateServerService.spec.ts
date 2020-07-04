import AppError from '@shared/errors/AppError';
import FakeServersRepository from '../repositories/fakes/FakeServersRepository';
import CreateServerService from './CreateServerService';

let fakeServersRepository: FakeServersRepository;
let createServerService: CreateServerService;
describe('CreateServerService', () => {
  beforeEach(() => {
    fakeServersRepository = new FakeServersRepository();

    createServerService = new CreateServerService(fakeServersRepository);
  });
  it('should be able to create a new server', async () => {
    const server = await createServerService.execute({
      name: 'myServer',
      id_discord: '123456',
    });

    expect(server).toHaveProperty('id');
  });

  it('should not be able to create server with same id discord', async () => {
    await createServerService.execute({
      name: 'myServer1',
      id_discord: '123456',
    });

    await expect(
      createServerService.execute({
        name: 'myServer2',
        id_discord: '123456',
      }),
    ).rejects.toEqual(new AppError('Server already registered'));
  });
});
