import { Ok, Result } from '@inpro-labs/core';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@shared/domain/interfaces/jwt.service.interface';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '@shared/domain/entities/token-payload.entity';

@Injectable()
export class GenerateTokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  execute(
    sessionId: string,
    user: User,
  ): Result<{ accessToken: string; refreshToken: string }> {
    const { id, email } = user.toObject();

    const payload = TokenPayload.create({
      sub: id,
      email: email.value,
      sid: sessionId,
    }).unwrap();

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      secret: this.configService.get('JWT_SECRET'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      secret: this.configService.get('JWT_SECRET'),
    });

    return Ok({ accessToken, refreshToken });
  }
}
