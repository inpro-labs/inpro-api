import { z } from 'zod';
import { SignInEventSchema } from '../../../presentation/schemas/auth/sign-in-event.schema';

export type SignInInputDTO = z.infer<typeof SignInEventSchema>;
