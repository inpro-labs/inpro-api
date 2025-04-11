import { Adapter } from '@inpro-labs/api-sdk';
import { User } from '@modules/auth/domain/aggregates/user.aggregate';
import { UserModel } from '@modules/auth/infra/models/user.model';

export class UserToModelAdapter implements Adapter<User, UserModel> {
  adaptOne(from: User) {
    const { id, email, username, verified, createdAt, updatedAt, password } =
      from.toObject();

    return {
      id,
      email: email.value,
      password: password!,
      username,
      verified,
      createdAt,
      updatedAt,
    };
  }

  adaptMany(from: User[]): UserModel[] {
    return from.map((item) => this.adaptOne(item));
  }
}
