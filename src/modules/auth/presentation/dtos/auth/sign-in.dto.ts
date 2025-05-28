import { createZodDto } from '@anatine/zod-nestjs';
import { signInSchema } from '../../schemas/auth/sign-in.schema';

export class SignInDTO extends createZodDto(signInSchema) {}
