import { injectable, container } from 'tsyringe';

import RegisterWelcomeMessageProvider from '@modules/discord/providers/events/RegisterWelcomeMessageProvider';
import RegisterAutoRoleProvider from '@modules/discord/providers/events/RegisterAutoRoleProvider';

@injectable()
class RegisterCustomsProvider {
  public async execute(): Promise<void> {
    container.resolve(RegisterWelcomeMessageProvider).execute();
    container.resolve(RegisterAutoRoleProvider).execute();
  }
}

export default RegisterCustomsProvider;
