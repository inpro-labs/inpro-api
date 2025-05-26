import { z } from 'zod';
import { createUserSchema } from '@modules/account/presentation/schemas/user/create-user.schema';
import { User } from '@modules/account/domain/aggregates/user.aggregate';

export type CreateUserInputDTO = z.infer<typeof createUserSchema>;

export type CreateUserOutputDTO = User;
