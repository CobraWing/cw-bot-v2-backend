import { injectable, container } from 'tsyringe';

import RegisterCategoriesCommandsProvider from '@modules/discord/providers/customs/RegisterCategoriesCommandsProvider';
import RegisterCustomCommandsProvider from '@modules/discord/providers/customs/RegisterCustomCommandsProvider';

@injectable()
class RegisterCustomsProvider {
  public async execute(): Promise<void> {
    container.resolve(RegisterCategoriesCommandsProvider).execute();
    container.resolve(RegisterCustomCommandsProvider).execute();
  }
}

export default RegisterCustomsProvider;
