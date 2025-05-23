import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.number().default(3000),
  JWT_SECRET: z.string(),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: z.string().regex(/^\d+[smhd]$/),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: z.string().regex(/^\d+[smhd]$/),
  DATABASE_URL: z.string(),
  REFRESH_TOKEN_HMAC_SECRET: z.string(),
  MONGO_URI: z.string(),
  MONGO_DATABASE: z.string(),
});

export type Env = z.infer<typeof envSchema>;
