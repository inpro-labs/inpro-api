import { Aggregate, Result, Fail, Ok, UID } from 'types-ddd';
import { SessionCreatedEvent } from '../events/session-created.event';
import { RefreshTokenHash } from '../value-objects/refresh-token-hash.value-object';
import { SessionRevokedEvent } from '../events/session-revoked.event';
import { DEVICE_TYPES } from '@shared/constants/devices';

interface Props {
  id?: UID;
  device: (typeof DEVICE_TYPES.values)[number];
  userAgent: string;
  refreshTokenHash: RefreshTokenHash;
  ip: string;
  userId: UID;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt?: Date;
}

export class Session extends Aggregate<Props> {
  static readonly deviceTypes = DEVICE_TYPES.values;

  private constructor(props: Props) {
    super(props);
  }

  static create(props: Props): Result<Session> {
    if (!Session.isValidProps(props)) return Fail('Invalid Session props');

    if (!props.createdAt) props.createdAt = new Date();

    const session = new Session(props);

    if (session.isNew()) {
      session.addEvent(new SessionCreatedEvent());
    }

    return Ok(session);
  }

  static isValidProps(props: Props) {
    if (!Session.deviceTypes.includes(props.device)) return false;

    return true;
  }

  public revoke() {
    this.props.revokedAt = new Date();
    this.addEvent(new SessionRevokedEvent());
  }

  get isExpired() {
    return !!this.props.revokedAt;
  }

  get isRevoked() {
    return this.props.expiresAt < new Date();
  }
}
