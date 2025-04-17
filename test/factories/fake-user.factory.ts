import { Combine, ID } from '@inpro-labs/core';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { Email } from '@modules/account/domain/value-objects/email.value-object';

export class UserFactory {
  static make(id?: string): User {
    const [userId, userEmail] = Combine([
      ID.create(id),
      Email.create('test@test.com'),
    ]).unwrap();

    return User.create({
      id: userId,
      email: userEmail,
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: 'password',
    }).unwrap();
  }
}
