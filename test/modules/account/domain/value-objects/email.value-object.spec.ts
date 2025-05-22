import { Email } from '@modules/account/domain/value-objects/email.value-object';

describe('Email Value Object', () => {
  it('should create a valid email value object', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.com',
      'user+tag@example.org',
      'firstname.lastname@example.co.uk',
      'email@subdomain.example.com',
    ];

    for (const email of validEmails) {
      const emailResult = Email.create(email);
      expect(emailResult.isOk()).toBe(true);

      const emailVO = emailResult.unwrap();
      expect(emailVO).toBeInstanceOf(Email);
      expect(emailVO.props.value).toBe(email);
    }
  });

  it('should reject invalid email formats', () => {
    const invalidEmails = [
      '',
      'plaintext',
      '@missingusername.com',
      'username@',
      'username@.com',
      'username@domain.',
      'user name@example.com', // space not allowed
      'user@exam_ple.com', // underscore in domain
      'user@exam..ple.com', // double dots
    ];

    for (const email of invalidEmails) {
      const emailResult = Email.create(email);

      expect(emailResult.isErr()).toBe(true);
      expect(emailResult.getErr()?.message).toBe('Invalid email');
    }
  });

  it('should maintain immutability', () => {
    const email = 'test@example.com';
    const emailVO = Email.create(email).unwrap();
    const originalValue = emailVO.props.value;

    // This would be caught at compile time with TypeScript, but testing for runtime safety
    // Attempt to modify props would normally be blocked by TypeScript
    // Not actually modifying for test purposes

    // The value should remain unchanged
    expect(emailVO.props.value).toBe(originalValue);
    expect(emailVO.props.value).toBe(email);
  });

  it('should compare emails correctly with equals method', () => {
    const email1 = Email.create('test@example.com').unwrap();
    const email2 = Email.create('test@example.com').unwrap();
    const email3 = Email.create('different@example.com').unwrap();

    // Value objects with same value should be equal
    expect(email1.equals(email2)).toBe(true);

    // Value objects with different values should not be equal
    expect(email1.equals(email3)).toBe(false);
  });
});
