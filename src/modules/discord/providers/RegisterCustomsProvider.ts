import { injectable, container } from 'tsyringe';

import RegisterCategoriesCommandsProvider from './RegisterCategoriesCommandsProvider';
import RegisterCustomCommandsProvider from './RegisterCustomCommandsProvider';

@injectable()
class RegisterCustomsProvider {
  public async execute(): Promise<void> {
    container.resolve(RegisterCategoriesCommandsProvider).execute();
    container.resolve(RegisterCustomCommandsProvider).execute();
  }
}

export default RegisterCustomsProvider;
