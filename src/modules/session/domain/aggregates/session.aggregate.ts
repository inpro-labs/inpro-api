import { SessionCreatedEvent } from '../events/session-created.event';
import { RefreshTokenHash } from '../value-objects/refresh-token-hash.value-object';
import { SessionRevokedEvent } from '../events/session-revoked.event';
import { DEVICE_TYPES } from '@shared/constants/devices';
import { Aggregate, Err, ID, Ok, Result } from '@sputnik-labs/api-sdk';

interface Props {
  id?: ID;
  device: (typeof DEVICE_TYPES.values)[number];
  userAgent: string;
  refreshTokenHash: RefreshTokenHash;
  ip: string;
  userId: ID;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Session extends Aggregate<Props> {
  static readonly deviceTypes = DEVICE_TYPES.values;

  private constructor(props: Props) {
    super(props);
  }

  static create(props: Props): Result<Session, Error> {
    if (!Session.isValidProps(props))
      return Err(new Error('Invalid Session props'));

    if (!props.createdAt) props.createdAt = new Date();

    const session = new Session(props);

    if (session.isNew()) {
      session.apply(new SessionCreatedEvent(session));
    }

    return Ok(session);
  }

  static isValidProps(props: Props) {
    if (!Session.deviceTypes.includes(props.device)) return false;

    return true;
  }

  public revoke() {
    if (this.isRevoked) return;

    this.set('revokedAt', new Date());
    this.apply(new SessionRevokedEvent(this));
  }

  get isExpired() {
    return !!this.get('revokedAt');
  }

  get isRevoked() {
    return !!this.get('revokedAt');
  }
}
