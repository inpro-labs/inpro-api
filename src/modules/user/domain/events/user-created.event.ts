import { User } from '../aggregates/user.aggregate';

export class UserCreatedEvent {
  constructor(public readonly user: User) {}
}
