import { SessionCreatedEvent } from '../events/session-created.event';
import { RefreshTokenHash } from '../value-objects/refresh-token-hash.value-object';
import { SessionRevokedEvent } from '../events/session-revoked.event';
import { DEVICE_TYPES } from '@shared/constants/devices';
import { Aggregate, Err, ID, Ok, Result } from '@inpro-labs/core';
import { z } from 'zod';

interface CreateProps {
  id?: ID;
  device: (typeof DEVICE_TYPES.values)[number];
  deviceId: string;
  userAgent: string;
  refreshTokenHash: RefreshTokenHash;
  ip: string;
  userId: ID;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  lastRefreshAt?: Date;
}

interface SessionProps {
  id?: ID;
  device: (typeof DEVICE_TYPES.values)[number];
  deviceId: string;
  userAgent: string;
  refreshTokenHash: RefreshTokenHash;
  ip: string;
  userId: ID;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastRefreshAt?: Date;
}

export class Session extends Aggregate<SessionProps> {
  static readonly deviceTypes = DEVICE_TYPES.values;
  static readonly schema = z.object({
    id: z.optional(z.custom<ID>((value) => value instanceof ID)),
    device: z.enum(Session.deviceTypes as [string, ...string[]]),
    deviceId: z.string(),
    userAgent: z.string(),
    refreshTokenHash: z.custom<RefreshTokenHash>(
      (value) => value instanceof RefreshTokenHash,
    ),
    ip: z.string(),
    userId: z.custom<ID>((value) => value instanceof ID),
    expiresAt: z.date(),
    revokedAt: z.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    lastRefreshAt: z.date().optional(),
  });

  private constructor(props: SessionProps) {
    super(props);
  }

  static create(props: CreateProps): Result<Session, Error> {
    if (!Session.isValidProps(props)) {
      return Err(new Error('Invalid Session props'));
    }

    const session = new Session({
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });

    if (session.isNew()) {
      session.apply(new SessionCreatedEvent(session));
    }

    return Ok(session);
  }

  static isValidProps(props: CreateProps) {
    console.log(Session.schema.safeParse(props).error);
    if (!Session.schema.safeParse(props).success) return false;

    return true;
  }

  public revoke() {
    if (this.isRevoked) return Err(new Error('Session already revoked'));

    this.set('revokedAt', new Date());
    this.set('updatedAt', new Date());
    this.apply(new SessionRevokedEvent(this));

    return Ok(this);
  }

  public rotateRefreshToken(newHash: RefreshTokenHash) {
    this.set('refreshTokenHash', newHash);
    this.set('updatedAt', new Date());
  }

  get isExpired() {
    return !!this.get('expiresAt') && this.get('expiresAt') < new Date();
  }

  get isRevoked() {
    return !!this.get('revokedAt');
  }

  public refresh(newHash: RefreshTokenHash) {
    this.set('lastRefreshAt', new Date());
    this.set('refreshTokenHash', newHash);
    this.set('expiresAt', new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));
    this.set('updatedAt', new Date());
  }
}
