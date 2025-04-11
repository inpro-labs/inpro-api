import { z } from 'zod';
import { CreateUserSchema } from '@modules/auth/presentation/schemas/user/create-user.schema';

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
