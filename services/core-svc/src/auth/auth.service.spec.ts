import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
  },
};

const mockJwt = {
  signAsync: jest.fn().mockResolvedValue('mock-token'),
};

const mockConfig = {
  get: jest.fn((key: string) => {
    const map: Record<string, string> = {
      JWT_SECRET:          'test-secret',
      JWT_REFRESH_SECRET:  'test-refresh-secret',
      JWT_EXPIRES_IN:      '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      RESEND_API_KEY:      're_test',
      EMAIL_FROM:          'test@test.kz',
    };
    return map[key];
  }),
};

const mockRedis = {
  setRefreshToken:        jest.fn().mockResolvedValue(undefined),
  getAndDeleteRefreshToken: jest.fn(),
  deleteRefreshToken:     jest.fn().mockResolvedValue(undefined),
  setResetCode:           jest.fn().mockResolvedValue(undefined),
  getAndDeleteResetCode:  jest.fn(),
  setVerificationToken:   jest.fn().mockResolvedValue(undefined),
  getAndDeleteVerificationToken: jest.fn(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService,  useValue: mockPrisma },
        { provide: JwtService,     useValue: mockJwt },
        { provide: ConfigService,  useValue: mockConfig },
        { provide: RedisService,   useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Silence the Resend constructor (it uses the API key)
    jest.spyOn(service as any, 'sendVerificationEmail').mockResolvedValue(undefined);
  });

  // ── register ────────────────────────────────────────────────────────────────
  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.register({ email: 'test@test.kz', password: 'Pass1234!', firstName: 'A', lastName: 'B', role: 'USER' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-id', email: 'test@test.kz', role: 'USER',
      });

      const result = await service.register({
        email: 'test@test.kz', password: 'Pass1234!',
        firstName: 'A', lastName: 'B', role: 'USER',
      } as any);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── login ───────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'x@x.kz', password: 'pass' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'uid', email: 'x@x.kz', passwordHash: await bcrypt.hash('correct', 12), isActive: true,
      });
      await expect(service.login({ email: 'x@x.kz', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens on successful login', async () => {
      const hash = await bcrypt.hash('correct', 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'uid', email: 'x@x.kz', passwordHash: hash, isActive: true, role: 'USER', isVerified: true,
      });

      const result = await service.login({ email: 'x@x.kz', password: 'correct' });
      expect(result).toHaveProperty('accessToken');
    });
  });

  // ── resetPassword ───────────────────────────────────────────────────────────
  describe('resetPassword', () => {
    it('should throw BadRequestException if reset code is invalid', async () => {
      mockRedis.getAndDeleteResetCode.mockResolvedValue(null);
      await expect(
        service.resetPassword({ email: 'x@x.kz', code: '123456', newPassword: 'NewPass1!' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if reset code does not match', async () => {
      mockRedis.getAndDeleteResetCode.mockResolvedValue('654321');
      await expect(
        service.resetPassword({ email: 'x@x.kz', code: '123456', newPassword: 'NewPass1!' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update password and invalidate refresh token on success', async () => {
      mockRedis.getAndDeleteResetCode.mockResolvedValue('123456');
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'uid', email: 'x@x.kz' });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.resetPassword({ email: 'x@x.kz', code: '123456', newPassword: 'NewPass1!' });
      expect(result).toHaveProperty('message');
      expect(mockRedis.deleteRefreshToken).toHaveBeenCalledWith('uid');
    });
  });
});
