import { Adapter } from '@inpro-labs/core';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { UserModel } from '@modules/account/infra/models/user.model';

export class UserToModelAdapter implements Adapter<User, UserModel> {
  adaptOne(from: User) {
    const { id, email, verified, createdAt, updatedAt, password } =
      from.toObject();

    return {
      id,
      email: email.value,
      password: password!,
      verified,
      createdAt,
      updatedAt,
    };
  }

  adaptMany(from: User[]): UserModel[] {
    return from.map((item) => this.adaptOne(item));
  }
}
