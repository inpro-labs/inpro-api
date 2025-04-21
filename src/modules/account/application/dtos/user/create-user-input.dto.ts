import { z } from 'zod';
import { CreateUserSchema } from '@modules/account/presentation/schemas/user/create-user.schema';

export type CreateUserInputDTO = z.infer<typeof CreateUserSchema>;
