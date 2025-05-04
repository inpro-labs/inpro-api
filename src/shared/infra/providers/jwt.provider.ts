import { JwtService } from '@shared/domain/interfaces/jwt.service.interface';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtServiceImpl } from '@shared/infra/services/jwt.service.impl';
import { EnvService } from '@config/env/env.service';

export const JwtProvider = {
  provide: JwtService,
  useFactory: (envService: EnvService, jwtService: NestJwtService) => {
    return new JwtServiceImpl(envService, jwtService);
  },
  inject: [EnvService, NestJwtService],
};
