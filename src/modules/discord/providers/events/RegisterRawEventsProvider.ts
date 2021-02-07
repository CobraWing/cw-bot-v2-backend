/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
import { injectable, container } from 'tsyringe';
import log from 'heroku-logger';
import { TextChannel } from 'discord.js';

import ClientProvider from '@modules/discord/providers/ClientProvider';

@injectable()
class RegisterRawEventsProvider {
  public async execute(): Promise<void> {
    log.info('[RegisterRawEventsProvider] Register raw event');
    const commandoClient = await container.resolve(ClientProvider).getCLient();

    commandoClient.on('raw', async (packet: any) => {
      if (packet.t !== 'MESSAGE_REACTION_ADD' && packet.t !== 'MESSAGE_REACTION_REMOVE') return;

      const channel = commandoClient.channels.cache.find(c => c.id === packet.d.channel_id);

      if (!channel || !channel.isText) {
        return;
      }

      if ((channel as TextChannel).messages.cache.find(m => m.id === packet.d.message_id)) {
        return;
      }

      const messages = await (channel as TextChannel).messages.fetch(undefined, false, true);
      const message = messages.find(m => m.id === packet.d.message_id);

      if (!message) return;

      let reaction;

      if (packet.d.emoji.id) {
        reaction = message.reactions.cache.find(r => r.emoji.id === packet.d.emoji.id);
      } else {
        reaction = message.reactions.cache.find(r => r.emoji.name === packet.d.emoji.name);
      }

      if (!reaction) return;

      const user = commandoClient.users.cache.find(u => u.id === packet.d.user_id);

      if (!user) return;

      reaction.users.cache.set(packet.d.user_id, user);

      if (packet.t === 'MESSAGE_REACTION_ADD') {
        commandoClient.emit('messageReactionAdd', reaction, user);
      }
      if (packet.t === 'MESSAGE_REACTION_REMOVE') {
        commandoClient.emit('messageReactionRemove', reaction, user);
      }
    });
  }
}

export default RegisterRawEventsProvider;
