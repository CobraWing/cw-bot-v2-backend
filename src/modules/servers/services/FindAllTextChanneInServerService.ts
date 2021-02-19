import { injectable, inject, container } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ClientProvider from '@modules/discord/providers/ClientProvider';

interface IChannel {
  label: string;
  value: string;
}

interface IRequest {
  discordId: string;
}

@injectable()
class FindAllTextChanneInServerService {
  constructor(
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute(data: IRequest): Promise<IChannel[]> {
    let channels = [] as IChannel[];
    const server = await this.serversRepository.findByIdDiscordAndEnabledServer(data.discordId);

    if (!server) {
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    const commandoClient = await container.resolve(ClientProvider).getCLient();

    const guild = commandoClient.guilds.cache.find(g => g.id === server.id_discord);

    if (guild && guild.available) {
      channels = guild.channels.cache
        .filter(c => c.isText())
        .map(c => {
          return {
            label: c.name,
            value: c.id,
          } as IChannel;
        });
      channels.sort((a, b) => (a.label > b.label ? 1 : -1));
    }

    return channels;
  }
}

export default FindAllTextChanneInServerService;
