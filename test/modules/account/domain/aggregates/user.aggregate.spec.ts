import { ID } from '@inpro-labs/core';
import { User } from '@modules/account/domain/aggregates/user.aggregate';
import { Email } from '@modules/account/domain/value-objects/email.value-object';
import { UserCreatedEvent } from '@modules/account/domain/events/user-created.event';

describe('User Aggregate', () => {
  const now = new Date();
  const validEmail = Email.create('test@example.com').unwrap();
  const validPassword = 'securePassword123';
  const validId = ID.create('user-123').unwrap();

  it('should create a valid user with minimal properties', () => {
    const result = User.create({
      email: validEmail,
    });

    expect(result.isOk()).toBe(true);

    const user = result.unwrap();
    expect(user).toBeInstanceOf(User);
    expect(user.get('email')).toBe(validEmail);
    expect(user.get('verified')).toBe(false); // Should default to false
    expect(user.get('createdAt')).toBeInstanceOf(Date);
    expect(user.get('updatedAt')).toBeInstanceOf(Date);
  });

  it('should create a valid user with all properties', () => {
    const result = User.create({
      id: validId,
      email: validEmail,
      password: validPassword,
      verified: true,
      createdAt: now,
      updatedAt: now,
    });

    expect(result.isOk()).toBe(true);

    const user = result.unwrap();
    expect(user).toBeInstanceOf(User);
    expect(user.id).toBe(validId);
    expect(user.get('email')).toBe(validEmail);
    expect(user.get('password')).toBe(validPassword);
    expect(user.get('verified')).toBe(true);
    expect(user.get('createdAt')).toBe(now);
    expect(user.get('updatedAt')).toBe(now);
  });

  it('should generate default ID when not provided', () => {
    const result = User.create({
      email: validEmail,
    });

    expect(result.isOk()).toBe(true);

    const user = result.unwrap();

    expect(user.id).toBeDefined();
    expect(user.id).toBeInstanceOf(ID);
  });

  it('should set updatedAt equal to createdAt if only createdAt is provided', () => {
    const result = User.create({
      email: validEmail,
      createdAt: now,
    });

    expect(result.isOk()).toBe(true);

    const user = result.unwrap();

    expect(user.get('createdAt')).toBe(now);
    expect(user.get('updatedAt')).toBe(now);
  });

  it('should fail when creating a user with invalid properties', () => {
    // Invalid email type (should be Email instance, not string)
    const result = User.create({
      // @ts-expect-error - Testing runtime validation
      email: 'not-an-email-instance',
    });

    expect(result.isErr()).toBe(true);
    expect(result.getErr()?.message).toBe('Invalid user props');
  });

  it('should apply UserCreatedEvent when user is created', () => {
    const result = User.create({
      email: validEmail,
    });

    expect(result.isOk()).toBe(true);

    const user = result.unwrap();
    const events = user.getUncommittedEvents();

    expect(events.length).toBe(1);
    const event = events[0] as UserCreatedEvent;
    expect(event).toBeInstanceOf(UserCreatedEvent);
    expect(event.user).toBe(user);
  });

  it('should correctly serialize with toObject()', () => {
    const user = User.create({
      id: validId,
      email: validEmail,
      password: validPassword,
      verified: true,
      createdAt: now,
      updatedAt: now,
    }).unwrap();

    const serialized = user.toObject();

    expect(serialized).toEqual({
      id: validId.value(),
      email: validEmail.toObject(),
      password: validPassword,
      verified: true,
      createdAt: now,
      updatedAt: now,
    });
  });

  it('should handle serialization with custom adapter', () => {
    // This is just a simple verification that adapters work
    // Without going into the complex type details
    const user = User.create({
      id: validId,
      email: validEmail,
      verified: true,
    }).unwrap();

    const serialized = user.toObject({
      adaptOne: () => ({ customField: 'custom value' }),
    });

    expect(serialized).toEqual({ customField: 'custom value' });
  });
});
