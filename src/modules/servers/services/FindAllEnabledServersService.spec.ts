import FakeServersRepository from '../repositories/fakes/FakeServersRepository';
import FindAllEnabledServersService from './FindAllEnabledServersService';

let fakeServersRepository: FakeServersRepository;
let findAllEnabledServersService: FindAllEnabledServersService;
describe('FindAllEnabledServersService', () => {
  beforeEach(() => {
    fakeServersRepository = new FakeServersRepository();

    findAllEnabledServersService = new FindAllEnabledServersService(
      fakeServersRepository,
    );
  });
  it('should be able to list all enabled server', async () => {
    const server1 = await fakeServersRepository.create({
      id_discord: '111111',
      name: 'server-1',
      enabled: true,
    });

    await fakeServersRepository.create({
      id_discord: '222222',
      name: 'server-2',
      enabled: false,
    });

    const server3 = await fakeServersRepository.create({
      id_discord: '333333',
      name: 'server-3',
      enabled: true,
    });

    const servers = await findAllEnabledServersService.execute();

    expect(servers).toEqual(expect.objectContaining([server1, server3]));
  });
});
