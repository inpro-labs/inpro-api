import { IUserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';
import { UserRepository } from '../repositories/user.repository.impl';

export const userRepositoryProvider = {
  provide: IUserRepository,
  useClass: UserRepository,
};
