import { createUserSchema } from '../../schemas/user/create-user.schema';
import { createZodDto } from '@anatine/zod-nestjs';

export class CreateUserDTO extends createZodDto(createUserSchema) {}
