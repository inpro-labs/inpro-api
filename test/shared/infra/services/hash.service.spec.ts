import { HashServiceImpl } from '@shared/infra/security/hash/services/hash.service';
import * as bcrypt from 'bcrypt';

// Mock for bcrypt (only used in unit tests)
jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('HashServiceImpl', () => {
  let hashService: HashServiceImpl;

  beforeEach(() => {
    hashService = new HashServiceImpl();
    jest.clearAllMocks();
  });

  describe('generateHash', () => {
    it('should successfully generate a hash', async () => {
      // Arrange
      const payload = 'password123';
      const mockSalt = 'mock-salt';
      const mockHash = 'hashed123456';

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      // Act
      const result = await hashService.generateHash(payload);

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledWith(8);
      expect(bcrypt.hash).toHaveBeenCalledWith(payload, mockSalt);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(mockHash);
    });

    it('should return error when an exception occurs', async () => {
      // Arrange
      const payload = 'password123';
      const mockError = new Error('Error generating hash');

      (bcrypt.genSalt as jest.Mock).mockRejectedValue(mockError);

      // Act
      const result = await hashService.generateHash(payload);

      // Assert
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(mockError);
    });
  });

  describe('compareHash', () => {
    it('should successfully compare hash when values match', async () => {
      // Arrange
      const payload = 'password123';
      const hashedPayload = 'hashed123456';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await hashService.compareHash(payload, hashedPayload);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(payload, hashedPayload);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(true);
    });

    it('should not successfully compare hash when values do not match', async () => {
      // Arrange
      const payload = 'password123';
      const hashedPayload = 'hashed123456';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await hashService.compareHash(payload, hashedPayload);

      console.log(result.unwrap());

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(payload, hashedPayload);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(false);
    });

    it('should return error when an exception occurs', async () => {
      // Arrange
      const payload = 'password123';
      const hashedPayload = 'hashed123456';
      const mockError = new Error('Error comparing hash');

      (bcrypt.compare as jest.Mock).mockRejectedValue(mockError);

      // Act
      const result = await hashService.compareHash(payload, hashedPayload);

      // Assert
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(mockError);
    });
  });
});
