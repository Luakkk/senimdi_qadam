import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPrisma = {
  notification: {
    findMany:    jest.fn(),
    count:       jest.fn(),
    update:      jest.fn(),
    updateMany:  jest.fn(),
    create:      jest.fn(),
  },
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  // ── getMyNotifications ────────────────────────────────────────────────────────
  describe('getMyNotifications', () => {
    it('should return personal + broadcast notifications', async () => {
      const items = [
        { id: 'n1', userId: 'user-1', title: 'Личное', isRead: false },
        { id: 'n2', userId: null,     title: 'Рассылка', isRead: false },
      ];
      mockPrisma.notification.findMany.mockResolvedValue(items);
      mockPrisma.notification.count.mockResolvedValue(2);

      const result = await service.getMyNotifications('user-1', 20);

      // Запрос должен включать и личные (userId = user-1) и broadcast (userId = null)
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { userId: 'user-1' },
              { userId: null },
            ]),
          }),
        }),
      );
      expect(result.items).toHaveLength(2);
      expect(result.unreadCount).toBe(2);
    });

    it('should filter unread when unreadOnly=true', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      await service.getMyNotifications('user-1', 20, undefined, true);

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isRead: false }),
        }),
      );
    });

    it('should return nextCursor when there are more items', async () => {
      // 21 items for limit=20 → nextCursor should exist
      const items = Array.from({ length: 21 }, (_, i) => ({
        id: `n${i}`, userId: 'user-1', title: `Уведомление ${i}`, isRead: false,
      }));
      mockPrisma.notification.findMany.mockResolvedValue(items);
      mockPrisma.notification.count.mockResolvedValue(0);

      const result = await service.getMyNotifications('user-1', 20);

      expect(result.items).toHaveLength(20);
      expect(result.nextCursor).toBeDefined();
    });
  });

  // ── markRead ──────────────────────────────────────────────────────────────────
  describe('markRead', () => {
    it('should mark specific notification as read', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.markRead('user-1', 'n1');

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'n1' }),
          data:  { isRead: true },
        }),
      );
      expect(result).toEqual({ success: true });
    });
  });

  // ── markAllRead ───────────────────────────────────────────────────────────────
  describe('markAllRead', () => {
    it('should mark all unread notifications as read', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllRead('user-1');

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isRead: false }),
          data:  { isRead: true },
        }),
      );
      expect(result).toEqual({ marked: 5 });
    });
  });

  // ── createForUser ─────────────────────────────────────────────────────────────
  describe('createForUser', () => {
    it('should create notification for specific user', async () => {
      mockPrisma.notification.create.mockResolvedValue({
        id: 'n1', userId: 'user-1', title: 'Ваша заявка одобрена', type: 'ORG_VERIFIED',
      });

      const result = await service.createForUser({
        userId: 'user-1',
        title:  'Ваша заявка одобрена',
        body:   'Организация успешно верифицирована',
        type:   'ORG_VERIFIED',
      });

      expect(result.userId).toBe('user-1');
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'user-1', type: 'ORG_VERIFIED' }),
        }),
      );
    });
  });

  // ── createBroadcast ───────────────────────────────────────────────────────────
  describe('createBroadcast', () => {
    it('should create broadcast notification with userId=null', async () => {
      mockPrisma.notification.create.mockResolvedValue({
        id: 'n1', userId: null, title: 'Системное обновление', type: 'BROADCAST',
      });

      const result = await service.createBroadcast({
        title: 'Системное обновление',
        body:  'Платформа обновлена до v2.0',
        type:  'BROADCAST',
      });

      expect(result.userId).toBeNull();
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: null }),
        }),
      );
    });
  });
});
