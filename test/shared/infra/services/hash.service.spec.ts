import { HashService } from '@shared/security/hash/services/hash.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('HashService', () => {
  let hashService: HashService;

  beforeEach(() => {
    hashService = new HashService();
    jest.clearAllMocks();
  });

  describe('generateHash', () => {
    it('should successfully generate a hash', async () => {
      const payload = 'password123';
      const mockSalt = 'mock-salt';
      const mockHash = 'hashed123456';

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await hashService.generateHash(payload);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(8);
      expect(bcrypt.hash).toHaveBeenCalledWith(payload, mockSalt);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(mockHash);
    });

    it('should return error when an exception occurs', async () => {
      const payload = 'password123';
      const mockError = new Error('Error generating hash');

      (bcrypt.genSalt as jest.Mock).mockRejectedValue(mockError);

      const result = await hashService.generateHash(payload);

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(mockError);
    });
  });

  describe('compareHash', () => {
    it('should successfully compare hash when values match', async () => {
      const payload = 'password123';
      const hashedPayload = 'hashed123456';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await hashService.compareHash(payload, hashedPayload);

      expect(bcrypt.compare).toHaveBeenCalledWith(payload, hashedPayload);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(true);
    });

    it('should not successfully compare hash when values do not match', async () => {
      const payload = 'password123';
      const hashedPayload = 'hashed123456';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await hashService.compareHash(payload, hashedPayload);

      expect(bcrypt.compare).toHaveBeenCalledWith(payload, hashedPayload);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(false);
    });

    it('should return error when an exception occurs', async () => {
      const payload = 'password123';
      const hashedPayload = 'hashed123456';
      const mockError = new Error('Error comparing hash');

      (bcrypt.compare as jest.Mock).mockRejectedValue(mockError);

      const result = await hashService.compareHash(payload, hashedPayload);

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(mockError);
    });
  });
});
