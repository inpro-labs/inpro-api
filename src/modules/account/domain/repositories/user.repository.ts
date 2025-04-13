import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { Result } from '@inpro-labs/api-sdk';

export abstract class UserRepository {
  abstract save(user: User): Promise<Result<void>>;
  abstract findByEmail(email: string): Promise<Result<User>>;
}
