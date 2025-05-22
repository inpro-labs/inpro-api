import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { Result } from '@inpro-labs/core';

export abstract class IUserRepository {
  abstract save(user: User): Promise<Result<void>>;
  abstract findByEmail(email: string): Promise<Result<User>>;
  abstract findById(id: string): Promise<Result<User>>;
}
