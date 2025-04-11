import { Adapter, Combine, ID } from '@inpro-labs/api-sdk';
import { UserModel } from '@modules/auth/infra/models/user.model';
import { User } from '@modules/auth/domain/aggregates/user.aggregate';
import { Email } from '@modules/auth/domain/value-objects/email.value-object';

export class UserToDomainAdapter implements Adapter<UserModel, User> {
  adaptOne(item: UserModel): User {
    const { id, email, username, verified, createdAt, updatedAt, password } =
      item;

    const [userId, userEmail] = Combine([
      ID.create(id),
      Email.create(email),
    ]).unwrap();

    return User.create({
      id: userId,
      email: userEmail,
      username,
      verified,
      createdAt,
      updatedAt,
      password,
    }).unwrap();
  }

  adaptMany(items: UserModel[]): User[] {
    return items.map((item) => this.adaptOne(item));
  }
}
