import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MessageSender } from '@prisma/client';

const mockPrisma = {
  booking: {
    findUnique: jest.fn(),
    findFirst:  jest.fn(),
    findMany:   jest.fn(),
  },
  bookingMessage: {
    updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    findMany:   jest.fn(),
    create:     jest.fn(),
    count:      jest.fn(),
  },
};

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ChatService>(ChatService);
  });

  describe('getMessages', () => {
    it('should throw NotFoundException if booking missing', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);
      await expect(service.getMessages('b1', 'u1', false)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b1', userId: 'other' });
      await expect(service.getMessages('b1', 'u1', false)).rejects.toThrow(ForbiddenException);
    });

    it('should mark incoming messages read and return the thread (user)', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b1', userId: 'u1' });
      mockPrisma.bookingMessage.findMany.mockResolvedValue([{ id: 'm1' }]);

      const result = await service.getMessages('b1', 'u1', false);

      expect(result).toHaveLength(1);
      // Пользователь читает входящие от менеджера
      expect(mockPrisma.bookingMessage.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ bookingId: 'b1', senderType: MessageSender.MANAGER, isRead: false }),
          data: { isRead: true },
        }),
      );
    });

    it('should allow a manager to read any booking', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b1', userId: 'other' });
      mockPrisma.bookingMessage.findMany.mockResolvedValue([]);
      await expect(service.getMessages('b1', 'mgr', true)).resolves.toEqual([]);
    });
  });

  describe('sendAsUser', () => {
    it('should throw NotFoundException if booking not owned by user', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);
      await expect(service.sendAsUser('u1', 'b1', { text: 'hi' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should create a USER message', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({ id: 'b1', userId: 'u1' });
      mockPrisma.bookingMessage.create.mockResolvedValue({ id: 'm1', senderType: MessageSender.USER });
      const result = await service.sendAsUser('u1', 'b1', { text: 'hi' } as any);
      expect(result.senderType).toBe(MessageSender.USER);
    });
  });

  describe('sendAsManager', () => {
    it('should throw NotFoundException if booking missing', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);
      await expect(service.sendAsManager('mgr', 'b1', { text: 'hi' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should create a MANAGER message', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({ id: 'b1' });
      mockPrisma.bookingMessage.create.mockResolvedValue({ id: 'm1', senderType: MessageSender.MANAGER });
      const result = await service.sendAsManager('mgr', 'b1', { text: 'ok' } as any);
      expect(result.senderType).toBe(MessageSender.MANAGER);
    });
  });

  describe('getUnreadCount', () => {
    it('should count all unread USER messages for a manager', async () => {
      mockPrisma.bookingMessage.count.mockResolvedValue(5);
      const result = await service.getUnreadCount('mgr', true);
      expect(result).toBe(5);
      expect(mockPrisma.bookingMessage.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { senderType: MessageSender.USER, isRead: false } }),
      );
    });

    it('should count unread MANAGER replies scoped to the user bookings', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([{ id: 'b1' }, { id: 'b2' }]);
      mockPrisma.bookingMessage.count.mockResolvedValue(2);
      const result = await service.getUnreadCount('u1', false);
      expect(result).toBe(2);
      expect(mockPrisma.bookingMessage.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            bookingId: { in: ['b1', 'b2'] },
            senderType: MessageSender.MANAGER,
          }),
        }),
      );
    });
  });
});
