import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { UserViewModel } from '../view-model/user.view-model';

export class UserPresenter {
  presentUser(user: User): UserViewModel {
    const { id, email, verified, createdAt, updatedAt } = user.toObject();

    return {
      id,
      email: email.value,
      verified,
      createdAt,
      updatedAt,
    };
  }
}
