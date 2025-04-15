import { z } from 'zod';
import { SignInEventSchema } from '../../../presentation/schemas/auth/sign-in-event.schema';

export type SignInDTO = z.infer<typeof SignInEventSchema>;
