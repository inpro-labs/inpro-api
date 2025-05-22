import { Adapter } from '@inpro-labs/core';
import { UserViewModel } from '../view-model/user.view-model';
import { User } from '@modules/account/domain/aggregates/user.aggregate';

export class UserToResponseAdapter implements Adapter<User, UserViewModel> {
  adaptOne(user: User): UserViewModel {
    const { id, email, createdAt, updatedAt, verified } = user.toObject();

    return {
      id,
      email: email.value,
      createdAt,
      updatedAt,
      verified,
    };
  }

  adaptMany(users: User[]): UserViewModel[] {
    return users.map((user) => this.adaptOne(user));
  }
}
