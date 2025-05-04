import { z } from 'zod';
import { signInSchema } from '@modules/auth/presentation/schemas/auth/sign-in.schema';

export type SignInInputDTO = z.infer<typeof signInSchema>;
