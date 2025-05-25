import { Injectable } from '@nestjs/common';
import { Env } from './env.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService {
  constructor(private configService: ConfigService<Env, true>) {}

  get<T extends keyof Env>(key: T) {
    return this.configService.get(key, { infer: true });
  }

  isProduction() {
    return this.get('NODE_ENV') === 'production';
  }
}
