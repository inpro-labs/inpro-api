import { Aggregate, Err, ID, Ok, Result } from '@inpro-labs/api-sdk';
import { Email } from '../value-objects/email.value-object';
import { z } from 'zod';
import { UserCreatedEvent } from '../events/user-created.event';

interface Props {
  id?: ID;
  email: Email;
  password?: string;
  username: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateProps {
  id?: ID;
  email: Email;
  password?: string;
  username: string;
  verified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Aggregate<Props> {
  static readonly schema = z.object({
    id: z.string().uuid().optional(),
    email: z.string().email(),
    password: z.string().optional(),
    username: z.string(),
    verified: z.boolean().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  });

  private constructor(props: Props) {
    super(props);
  }

  static create(props: CreateProps): Result<User> {
    if (!User.isValidProps(props)) {
      return Err(new Error('Invalid user props'));
    }

    const createdAt = props.createdAt ?? new Date();
    const updatedAt = props.updatedAt ?? createdAt;

    const user = new User({
      ...props,
      verified: props.verified ?? false,
      createdAt,
      updatedAt,
    });

    user.apply(new UserCreatedEvent(user));

    return Ok(user);
  }

  static isValidProps(props: CreateProps) {
    if (this.schema.safeParse(props).success) return true;

    return false;
  }
}
