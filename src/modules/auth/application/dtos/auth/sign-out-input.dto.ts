import { signOutSchema } from '@modules/auth/presentation/schemas/auth/sign-out.schema';
import { z } from 'zod';

export type SignOutInputDTO = z.infer<typeof signOutSchema>;
