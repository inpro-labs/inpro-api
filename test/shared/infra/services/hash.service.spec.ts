import { Test, TestingModule } from '@nestjs/testing';
import { HashServiceImpl } from '@shared/infra/security/hash/services/hash.service';
import { HashService } from '@shared/domain/interfaces/hash.service.interface';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('HashService', () => {
  let service: HashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: HashService,
          useClass: HashServiceImpl,
        },
      ],
    }).compile();

    service = module.get<HashService>(HashService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('generateHash', () => {
    it('should generate a hash successfully', async () => {
      const payload = 'password123';
      const salt = 'generated-salt';
      const expectedHash = 'hashed-password';

      // Mock implementations
      (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(expectedHash);

      const result = await service.generateHash(payload);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(expectedHash);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(8);
      expect(bcrypt.hash).toHaveBeenCalledWith(payload, salt);
    });

    it('should return error when hashing fails', async () => {
      const payload = 'password123';
      const expectedError = new Error('Hash generation failed');

      (bcrypt.genSalt as jest.Mock).mockRejectedValue(expectedError);

      const result = await service.generateHash(payload);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()).toBe(expectedError);
    });
  });

  describe('compareHash', () => {
    it('should compare hashes successfully - matching', async () => {
      const payload = 'password123';
      const hashed = 'hashed-password';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.compareHash(payload, hashed);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(payload, hashed);
    });

    it('should compare hashes successfully - non-matching', async () => {
      const payload = 'password123';
      const hashed = 'hashed-password';

      // Mock implementation for a non-matching hash
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.compareHash(payload, hashed);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(payload, hashed);
    });

    it('should return error when comparison fails', async () => {
      const payload = 'password123';
      const hashed = 'hashed-password';
      const expectedError = new Error('Compare failed');

      // Mock implementation to throw an error
      (bcrypt.compare as jest.Mock).mockRejectedValue(expectedError);

      const result = await service.compareHash(payload, hashed);

      expect(result.isErr()).toBe(true);
      expect(result.getErr()).toBe(expectedError);
    });
  });
});
