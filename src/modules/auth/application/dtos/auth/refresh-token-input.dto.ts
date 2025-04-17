import { z } from 'zod';
import { refreshTokenSchema } from '../../../presentation/schemas/auth/refresh-token.schema';

export type RefreshTokenInputDTO = z.infer<typeof refreshTokenSchema>;
