import { EnvService } from '@config/env/env.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Mongoose } from 'mongoose';

@Injectable()
export class MongooseGateway implements OnModuleInit {
  private readonly mongoose: Mongoose;
  private readonly logger = new Logger(MongooseGateway.name);

  constructor(private readonly envService: EnvService) {
    this.mongoose = new Mongoose();
  }

  async onModuleInit() {
    await this.mongoose.connect(this.envService.get('MONGO_URI'), {
      dbName: 'ms-auth-db',
      user: this.envService.get('MONGO_USER'),
      pass: this.envService.get('MONGO_PASSWORD'),
    });

    this.logger.log('Connected to MongoDB');
  }
}
