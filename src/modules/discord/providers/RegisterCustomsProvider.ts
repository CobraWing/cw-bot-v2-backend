import { injectable, container } from 'tsyringe';

import RegisterCategoriesCommandsProvider from './customs/RegisterCategoriesCommandsProvider';
import RegisterCustomCommandsProvider from './customs/RegisterCustomCommandsProvider';

@injectable()
class RegisterCustomsProvider {
  public async execute(): Promise<void> {
    container.resolve(RegisterCategoriesCommandsProvider).execute();
    container.resolve(RegisterCustomCommandsProvider).execute();
  }
}

export default RegisterCustomsProvider;
