import { HashService } from '@shared/security/hash/services/hash.service';

describe('HashService', () => {
  let hashService: HashService;

  beforeEach(() => {
    hashService = new HashService();
    jest.clearAllMocks();
  });

  describe('Integration Tests', () => {
    // For integration tests, we'll restore the original implementation
    beforeAll(() => {
      jest.restoreAllMocks();
    });

    it('should correctly generate and compare hash in a real scenario', async () => {
      // Arrange
      const password = 'mySecurePassword123';

      // Act
      const hashResult = await hashService.generateHash(password);

      expect(hashResult.isOk()).toBe(true);

      const generatedHash = hashResult.unwrap();

      // Assert password matches hash
      const compareResult = await hashService.compareHash(
        password,
        generatedHash,
      );
      expect(compareResult.isOk()).toBe(true);
      expect(compareResult.unwrap()).toBe(true);

      // Assert wrong password doesn't match
      const wrongPasswordResult = await hashService.compareHash(
        'wrongPassword',
        generatedHash,
      );
      expect(wrongPasswordResult.isOk()).toBe(true);
      expect(wrongPasswordResult.unwrap()).toBe(false);
    });

    it('should generate different hashes for the same password', async () => {
      // Arrange
      const password = 'mySecurePassword123';

      // Act
      const hashResult1 = await hashService.generateHash(password);
      const hashResult2 = await hashService.generateHash(password);

      // Assert
      expect(hashResult1.isOk()).toBe(true);
      expect(hashResult2.isOk()).toBe(true);

      const hash1 = hashResult1.unwrap();
      const hash2 = hashResult2.unwrap();

      // Different hashes due to different salts
      expect(hash1).not.toBe(hash2);

      // Both hashes should validate with the original password
      const compareResult1 = await hashService.compareHash(password, hash1);
      const compareResult2 = await hashService.compareHash(password, hash2);

      expect(compareResult1.unwrap()).toBe(true);
      expect(compareResult2.unwrap()).toBe(true);
    });
  });
});
