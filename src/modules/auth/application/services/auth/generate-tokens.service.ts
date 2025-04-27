import { Ok, Result } from '@inpro-labs/core';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@modules/account/domain/aggregates/user.aggregate';

@Injectable()
export class GenerateTokensService {
  constructor(private readonly jwtService: JwtService) {}

  execute(
    sessionId: string,
    user: User,
  ): Result<{ accessToken: string; refreshToken: string }> {
    const { id, email } = user.toObject();

    const payload = {
      sub: id,
      email: email.value,
      sid: sessionId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
      secret: process.env.JWT_SECRET,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
      secret: process.env.JWT_SECRET,
    });

    return Ok({ accessToken, refreshToken });
  }
}
