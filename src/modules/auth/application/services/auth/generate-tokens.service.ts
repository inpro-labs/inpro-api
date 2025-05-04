import { Ok, Result } from '@inpro-labs/core';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@shared/domain/interfaces/jwt.service.interface';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { TokenPayload } from '@shared/domain/value-objects/token-payload.entity';
import { EnvService } from '@config/env/env.service';

@Injectable()
export class GenerateTokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
  ) {}

  execute(
    sessionId: string,
    user: User,
    deviceId: string,
  ): Result<{ accessToken: string; refreshToken: string }> {
    const { id, email } = user.toObject();

    const payload = TokenPayload.create({
      sub: id,
      email: email.value,
      sid: sessionId,
      deviceId: deviceId,
    }).unwrap();

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.envService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      secret: this.envService.get('JWT_SECRET'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.envService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      secret: this.envService.get('JWT_SECRET'),
    });

    return Ok({ accessToken, refreshToken });
  }
}
