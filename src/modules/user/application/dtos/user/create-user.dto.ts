import { z } from 'zod';
import { CreateUserSchema } from '@modules/user/presentation/schemas/create-user.schema';

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
