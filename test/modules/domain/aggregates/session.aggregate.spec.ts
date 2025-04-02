import { RefreshTokenHash } from '@modules/session/domain/value-objects/refresh-token-hash.value-object';
import { Combine, ID } from '@sputnik-labs/api-sdk';
import { Session } from '@modules/session/domain/aggregates/session.aggregate';
import { DEVICE_TYPES } from '@shared/constants/devices';

describe('Session Aggregate', () => {
  const now = new Date();

  const makeValidAttributes = () =>
    Combine([
      ID.create('session-id'),
      ID.create('user-id'),
      RefreshTokenHash.create('hash'),
    ]).unwrap();

  const makeValidProps = (overrides = {}) => {
    const [id, userId, refreshTokenHash] = makeValidAttributes();

    return {
      id,
      userId,
      refreshTokenHash,
      device: DEVICE_TYPES.values[0],
      userAgent: 'TestAgent/1.0',
      ip: '127.0.0.1',
      createdAt: now,
      updatedAt: now,
      expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24), // +1 dia
      revokedAt: undefined,
      ...overrides,
    };
  };

  const createValidSession = (overrides = {}) =>
    Session.create(makeValidProps(overrides)).unwrap();

  it('should create a session with valid props', () => {
    const props = makeValidProps();
    const session = Session.create(props).unwrap();

    expect(session.id.equals(props.id)).toBe(true);
    expect(session.get('userId').equals(props.userId)).toBe(true);
    expect(session.get('refreshTokenHash').equals(props.refreshTokenHash)).toBe(
      true,
    );
    expect(session.get('device')).toEqual(props.device);
    expect(session.get('userAgent')).toEqual(props.userAgent);
    expect(session.get('ip')).toEqual(props.ip);
    expect(session.get('createdAt')).toEqual(props.createdAt);
    expect(session.get('expiresAt')).toEqual(props.expiresAt);
    expect(session.get('revokedAt')).toBeUndefined();
  });

  it('should fail to create a session with invalid device', () => {
    const [id, userId, refreshTokenHash] = makeValidAttributes();

    const result = Session.create({
      id,
      userId,
      refreshTokenHash,
      device: 'invalid-device',
      userAgent: 'Agent',
      ip: 'localhost',
      createdAt: now,
      updatedAt: now,
      expiresAt: new Date(now.getTime() + 86400000),
      revokedAt: undefined,
    });

    expect(result.isErr()).toBe(true);
  });

  it('should revoke a session', () => {
    const session = createValidSession();

    expect(session.get('revokedAt')).toBeUndefined();

    session.revoke();

    const revokedAt = session.get('revokedAt');
    expect(revokedAt).toBeInstanceOf(Date);
    expect(revokedAt!.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('should not change revokedAt if revoked multiple times', () => {
    const session = createValidSession();

    session.revoke();
    const firstRevokedAt = session.get('revokedAt');

    session.revoke();
    const secondRevokedAt = session.get('revokedAt');

    expect(firstRevokedAt).toEqual(secondRevokedAt);
  });

  it('should apply SessionCreatedEvent when session is created', () => {
    const session = createValidSession({ id: undefined });

    const events = session.getUncommittedEvents();

    expect(events.length).toBe(1);
    expect(events[0].constructor.name).toBe('SessionCreatedEvent');
  });

  it('should apply SessionRevokedEvent when session is revoked', () => {
    const session = createValidSession();

    session.revoke();

    const events = session.getUncommittedEvents();

    expect(events.length).toBe(1);
    expect(events[0].constructor.name).toBe('SessionRevokedEvent');
  });
});
