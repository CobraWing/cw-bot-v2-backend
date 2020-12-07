import { injectable, container } from 'tsyringe';

import RegisterWelcomeMessageProvider from './events/RegisterWelcomeMessageProvider';

@injectable()
class RegisterCustomsProvider {
  public async execute(): Promise<void> {
    container.resolve(RegisterWelcomeMessageProvider).execute();
  }
}

export default RegisterCustomsProvider;
