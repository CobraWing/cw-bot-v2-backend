import IDefaultCommandRepository from '../IDefaultCommandRepository';

import DefaultCommand from '../../entities/DefaultCommand';

class FakeDefaultCommandRepository implements IDefaultCommandRepository {
  private defauldCommands: DefaultCommand[] = [];

  public async findByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<DefaultCommand | undefined> {
    return this.defauldCommands.find(dc => dc.id === id);
  }
}

export default FakeDefaultCommandRepository;
