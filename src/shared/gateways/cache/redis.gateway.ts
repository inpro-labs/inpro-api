import { EnvService } from '@config/env/env.service';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Redis } from 'ioredis';

export type RedisClient = Redis;

@Injectable()
export class RedisGateway implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(RedisGateway.name);

  constructor(@Inject(EnvService) private readonly envService: EnvService) {
    this.redis = new Redis({
      host: this.envService.get('REDIS_HOST'),
      port: this.envService.get('REDIS_PORT'),
    });
  }

  async onModuleInit() {
    await this.redis.connect((error) => {
      if (error) {
        this.logger.error(error);
        throw error;
      }
    });

    this.logger.log('Redis connected');
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, 'EX', ttl);
    } else {
      await this.redis.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  getClient(): RedisClient {
    return this.redis;
  }
}
