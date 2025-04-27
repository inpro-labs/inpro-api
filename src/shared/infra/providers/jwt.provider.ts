import { JwtService } from '@shared/domain/interfaces/jwt.service.interface';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtServiceImpl } from '@shared/infra/services/jwt.service.impl';
import { ConfigService } from '@nestjs/config';

export const JwtProvider = {
  provide: JwtService,
  useFactory: (configService: ConfigService, jwtService: NestJwtService) => {
    return new JwtServiceImpl(configService, jwtService);
  },
  inject: [ConfigService, NestJwtService],
};
