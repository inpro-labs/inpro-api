import { IJwtService } from '../interfaces/jwt.service.interface';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { EnvService } from '@config/env/env.service';
import { JwtService } from '../services/jwt.service.impl';

export const JwtProvider = {
  provide: IJwtService,
  useFactory: (envService: EnvService, jwtService: NestJwtService) => {
    return new JwtService(envService, jwtService);
  },
  inject: [EnvService, NestJwtService],
};
