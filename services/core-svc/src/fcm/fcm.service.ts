import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private initialized = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const projectId   = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('FCM не настроен — FIREBASE_* переменные не заданы. Push-уведомления отключены.');
      return;
    }

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
    }

    this.initialized = true;
    this.logger.log('Firebase Admin SDK инициализирован');
  }

  // ── Persist notification to DB ────────────────────────────────────────────
  private async persistNotification(userId: string, payload: PushPayload): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          userId,
          title: payload.title,
          body:  payload.body,
          type:  payload.data?.type ?? 'general',
          data:  payload.data ? (payload.data as any) : undefined,
        },
      });
    } catch {
      // Non-critical — don't block push flow
    }
  }

  // ── Отправить уведомление конкретному пользователю ────────────────────────
  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    // Persist regardless of FCM status so user has notification history
    await this.persistNotification(userId, payload);

    if (!this.initialized) return;

    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (tokens.length === 0) return;

    const fcmTokens = tokens.map(t => t.token);
    await this.sendToTokens(fcmTokens, payload);
  }

  // ── Отправить уведомление нескольким пользователям (broadcast) ────────────
  async sendToUsers(userIds: string[], payload: PushPayload): Promise<void> {
    // Persist for each user
    await Promise.all(userIds.map(uid => this.persistNotification(uid, payload)));

    if (!this.initialized || userIds.length === 0) return;

    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId: { in: userIds } },
      select: { token: true },
    });

    if (tokens.length === 0) return;
    await this.sendToTokens(tokens.map(t => t.token), payload);
  }

  // ── Broadcast всем (например: новая новость опубликована) ─────────────────
  async broadcastToAll(payload: PushPayload): Promise<void> {
    if (!this.initialized) return;

    // Отправляем батчами по 500 токенов (FCM limit)
    let offset = 0;
    const batchSize = 500;

    while (true) {
      const tokens = await this.prisma.deviceToken.findMany({
        take:  batchSize,
        skip:  offset,
        select: { token: true, userId: true },
      });

      if (tokens.length === 0) break;

      // Persist for each unique user
      const userIds = [...new Set(tokens.map(t => t.userId))];
      await Promise.all(userIds.map(uid => this.persistNotification(uid, payload)));

      await this.sendToTokens(tokens.map(t => t.token), payload);
      offset += batchSize;
      if (tokens.length < batchSize) break;
    }
  }

  // ── Низкоуровневая отправка ────────────────────────────────────────────────
  private async sendToTokens(tokens: string[], payload: PushPayload): Promise<void> {
    if (tokens.length === 0) return;

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: payload.title,
          body:  payload.body,
        },
        data: payload.data ?? {},
        android: {
          priority: 'high',
          notification: { sound: 'default' },
        },
        apns: {
          payload: { aps: { sound: 'default' } },
        },
      });

      // Удаляем невалидные токены из БД
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          invalidTokens.push(tokens[idx]);
        }
      });

      if (invalidTokens.length > 0) {
        await this.prisma.deviceToken.deleteMany({
          where: { token: { in: invalidTokens } },
        });
        this.logger.log(`Удалено ${invalidTokens.length} устаревших FCM токенов`);
      }

      this.logger.log(`Push отправлен: ${response.successCount} успешно, ${response.failureCount} ошибок`);
    } catch (err) {
      this.logger.error('Ошибка FCM sendEachForMulticast', err);
    }
  }
}
