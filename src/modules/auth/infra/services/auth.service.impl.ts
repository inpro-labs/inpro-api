import { Err, Ok, Result } from '@inpro-labs/core';
import { UserRepository } from '@modules/account/domain/interfaces/repositories/user.repository.interface';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import { SessionRepository } from '@modules/auth/domain/interfaces/repositories/session.repository.interface';
import { Session } from '@modules/auth/domain/aggregates/session.aggregate';
import { AuthService } from '@modules/auth/application/interfaces/services/auth.service.interface';

@Injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async validateUserCredentials(
    password: string,
    email: string,
  ): Promise<Result<User>> {
    const user = await this.userRepository.findByEmail(email);

    if (user.isErr()) {
      return Err(new Error('Invalid credentials'));
    }

    const compareResult = await this.hashService.compareHash(
      user.unwrap().get('password')!,
      password,
    );

    if (!compareResult.unwrap()) {
      return Err(new Error('Invalid credentials'));
    }

    return Ok(user.unwrap());
  }

  generateTokens(
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

  async getRefreshTokenSession(
    refreshToken: string,
  ): Promise<Result<{ session: Session; user: User }>> {
    const hashedRefreshToken =
      await this.hashService.generateHash(refreshToken);

    const sessionResult = await this.sessionRepository.findByRefreshToken(
      hashedRefreshToken.unwrap(),
    );

    if (sessionResult.isErr()) {
      return Err(new Error('Invalid refresh token'));
    }

    const session = sessionResult.unwrap();

    if (session.isExpired || session.isRevoked) {
      return Err(new Error('Session is invalid'));
    }

    const user = await this.userRepository.findById(
      session.get('userId').value(),
    );

    if (user.isErr()) {
      return Err(new Error('User not found'));
    }

    return Ok({ session, user: user.unwrap() });
  }
}
