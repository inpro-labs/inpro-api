import { DynamicModule, Module, OnModuleInit, Logger } from '@nestjs/common';
import { Mongoose, Schema } from 'mongoose';
import { EnvService } from '@config/env/env.service';

interface SchemaDefinition {
  name: string;
  schema: Schema;
  discriminators?: SchemaDefinition[];
}

@Module({})
export class MongooseGateway implements OnModuleInit {
  private static schemas: SchemaDefinition[] = [];
  private readonly mongoose = new Mongoose();
  private readonly logger = new Logger(MongooseGateway.name);

  constructor(private readonly env: EnvService) {}

  static withSchemas(...schemas: SchemaDefinition[]): DynamicModule {
    MongooseGateway.schemas.push(...schemas);

    return {
      module: MongooseGateway,
      providers: [MongooseGateway, EnvService],
      exports: [MongooseGateway],
    };
  }

  async onModuleInit() {
    await this.mongoose.connect(this.env.get('MONGO_URI'), {
      dbName: this.env.get('MONGO_DATABASE'),
    });
    this.logger.log('Connected to MongoDB');

    const conn = this.mongoose.connection;

    for (const { name, schema, discriminators } of MongooseGateway.schemas) {
      if (!conn.models[name]) {
        const model = conn.model(name, schema);
        if (discriminators) {
          for (const discriminator of discriminators) {
            model.discriminator(discriminator.name, discriminator.schema);
          }
        }
      }
    }
    this.logger.log(
      `Registered schemas: ${MongooseGateway.schemas.map((s) => s.name).join(', ')}`,
    );
  }

  getConnection() {
    return this.mongoose.connection;
  }

  get models() {
    return this.mongoose.models;
  }
}
