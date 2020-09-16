import { singleton } from 'tsyringe';
import 'discord.js';
import Commando from 'discord.js-commando';
import log from 'heroku-logger';
import discordConfig from '@config/discordConfig';

@singleton()
class ClientProvider {
  private client: Commando.CommandoClient = new Commando.CommandoClient();

  constructor() {
    const { botToken } = discordConfig.authentication;

    if (botToken) {
      this.client.login(botToken);
    } else {
      log.error('bot key not defined');
    }

    this.client.on('ready', () => {
      log.info('🤖 Bot Ready!');
    });
  }

  public getCLient(): Promise<Commando.CommandoClient> {
    return new Promise((resolve, reject) => {
      if (this.client.uptime && this.client.uptime > 0) {
        resolve(this.client);
      }
      this.client.on('ready', () => {
        resolve(this.client);
      });
      this.client.on('error', () => {
        reject(this.client);
      });
    });
  }
}

export default ClientProvider;
