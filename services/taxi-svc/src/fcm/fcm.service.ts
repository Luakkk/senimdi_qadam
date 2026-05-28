import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Лёгкая обёртка над Firebase Admin SDK для taxi-svc.
 * Отправляет уведомления по raw FCM-токену (без обращения к БД).
 * Токены водителей хранятся в Driver.fcmToken (taxi_db).
 * Токены пользователей живут в core_db — taxi-svc шлёт им уведомления
 * через HTTP-вызов к core-svc (POST /api/internal/notify).
 */
@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private initialized = false;

  onModuleInit() {
    const projectId   = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('FCM не настроен — FIREBASE_* переменные не заданы.');
      return;
    }

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
    }

    this.initialized = true;
    this.logger.log('Firebase Admin SDK инициализирован (taxi-svc)');
  }

  /** Отправить уведомление по одному FCM-токену. */
  async send(token: string, payload: PushPayload): Promise<void> {
    if (!this.initialized || !token) return;
    try {
      await admin.messaging().send({
        token,
        notification: { title: payload.title, body: payload.body },
        data: payload.data ?? {},
        android: { priority: 'high', notification: { sound: 'default' } },
        apns: { payload: { aps: { sound: 'default' } } },
      });
    } catch (err: any) {
      // Не прерываем основной flow из-за проблем с push
      this.logger.warn(`FCM send failed for token ...${token.slice(-8)}: ${err?.message}`);
    }
  }

  /** Отправить уведомление нескольким токенам (батч до 500). */
  async sendMulticast(tokens: string[], payload: PushPayload): Promise<void> {
    if (!this.initialized || tokens.length === 0) return;
    try {
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title: payload.title, body: payload.body },
        data: payload.data ?? {},
        android: { priority: 'high', notification: { sound: 'default' } },
        apns: { payload: { aps: { sound: 'default' } } },
      });
    } catch (err: any) {
      this.logger.warn(`FCM multicast failed: ${err?.message}`);
    }
  }
}
