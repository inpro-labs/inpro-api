import { z } from 'zod';
import { createUserSchema } from '@modules/account/presentation/schemas/user/create-user.schema';

export type CreateUserInputDTO = z.infer<typeof createUserSchema>;
