import { Module } from '@nestjs/common';
import { AdminModule as AdminJSModule } from '@adminjs/nestjs';
import AdminJS from 'adminjs';
import * as AdminJSPrisma from '@adminjs/prisma';
import { getModelByName } from '@adminjs/prisma';
import axios from 'axios';

// Два Prisma клиента — каждый к своей БД
// Импортируем весь модуль (* as ...) чтобы getModelByName получил clientModule.Prisma.dmmf
import * as CoreClientModule from '../../generated/core';
import * as TaxiClientModule from '../../generated/taxi';
const { PrismaClient: CorePrismaClient } = CoreClientModule as any;
const { PrismaClient: TaxiPrismaClient } = TaxiClientModule as any;

// Регистрируем Prisma-адаптер для AdminJS (один раз при старте)
AdminJS.registerAdapter({
  Resource: AdminJSPrisma.Resource,
  Database: AdminJSPrisma.Database,
});

@Module({})
export class AdminModule {
  static forRoot() {
    return AdminJSModule.createAdminAsync({
      useFactory: async () => {
        // ── Инициализируем оба клиента и подключаемся к БД ─────────────────
        // Prisma v7: URL передаётся в конструктор, не в schema.prisma
        const coreClient = new CorePrismaClient({
          datasourceUrl: process.env.CORE_DB_URL || 'postgresql://core_user:core_pass@localhost:5434/core_db',
        });
        const taxiClient = new TaxiPrismaClient({
          datasourceUrl: process.env.TAXI_DB_URL || 'postgresql://taxi_user:taxi_pass@localhost:5435/taxi_db',
        });
        await coreClient.$connect();
        await taxiClient.$connect();

        // getModelByName и getEnums ожидают clientModule.Prisma.dmmf.datamodel.
        // Передаём МИНИМАЛЬНУЮ обёртку вместо полного модуля:
        // полный CoreClientModule содержит Proxy-объекты Prisma enum'ов, которые
        // lodash.merge (внутри adminjs) ломает при попытке вызвать isArrayLike(obj).length
        const coreRawPrisma = (CoreClientModule as any).Prisma;
        const taxiRawPrisma = (TaxiClientModule as any).Prisma;
        const coreDmmf  = { Prisma: { dmmf: coreRawPrisma?.dmmf } };
        const taxiDmmf  = { Prisma: { dmmf: taxiRawPrisma?.dmmf } };

        // ── Цвета темы (зелёный СенімдіҚадам) ─────────────────────────────
        const colors = {
          primary100: '#0d4f23',
          primary80:  '#167130',
          primary60:  '#1e8f3d',
          primary40:  '#4caf73',
          primary20:  '#a8dbb8',
          grey100:    '#1a1a2e',
          grey80:     '#2d2d44',
          grey60:     '#4a4a6a',
          grey40:     '#7a7a9a',
          grey20:     '#c5c5d8',
          white:      '#ffffff',
          accent:     '#167130',
          love:       '#dc3545',
        };

        return {
          adminJsOptions: {
            rootPath: '/admin',
            branding: {
              companyName: 'СенімдіҚадам Admin',
              logo:        false,
              favicon:     '',
              theme:       { colors },
            },

            // ── Дашборд: статистика из обеих БД ──────────────────────────────
            dashboard: {
              handler: async () => {
                try {
                  const [
                    usersTotal, usersActive,
                    orgsTotal,  orgsPending,
                    newsPending, commentsPending,
                    ticketsOpen,
                    bookingsTotal, bookingsPending,
                    driversActive,
                  ] = await Promise.all([
                    coreClient.user.count(),
                    coreClient.user.count({ where: { isActive: true } }),
                    coreClient.organization.count(),
                    coreClient.organization.count({ where: { status: 'PENDING' } }),
                    coreClient.news.count({ where: { status: 'PENDING' } }),
                    coreClient.newsComment.count({ where: { status: 'PENDING' } }),
                    coreClient.ticket.count({ where: { status: 'OPEN' } }),
                    taxiClient.booking.count(),
                    taxiClient.booking.count({ where: { status: 'PENDING' } }),
                    taxiClient.driver.count({ where: { status: 'ACTIVE' } }),
                  ]);

                  return {
                    usersTotal,     usersActive,
                    orgsTotal,      orgsPending,
                    newsPending,    commentsPending,
                    ticketsOpen,
                    bookingsTotal,  bookingsPending,
                    driversActive,
                  };
                } catch {
                  return {};
                }
              },
              // Используем стандартный дашборд AdminJS — dashboard.jsx не нужен
            },

            // ════════════════════════════════════════════════════════════════
            // РЕСУРСЫ — core_db
            // ════════════════════════════════════════════════════════════════
            resources: [

              // ── 1. Пользователи ──────────────────────────────────────────
              {
                resource: { model: getModelByName('User', coreDmmf), client: coreClient, clientModule: coreDmmf },
                options: {
                  navigation:        { name: 'Core DB', icon: 'Database' },
                  listProperties:    ['id', 'email', 'role', 'isActive', 'isVerified', 'createdAt'],
                  showProperties:    ['id', 'email', 'role', 'isActive', 'isVerified', 'googleId', 'createdAt', 'updatedAt'],
                  editProperties:    ['role', 'isActive', 'isVerified'],
                  filterProperties:  ['email', 'role', 'isActive'],
                  properties: {
                    passwordHash: { isVisible: false }, // хеш пароля НИКОГДА не показываем
                    id:           { isTitle: true },
                    role: {
                      availableValues: [
                        { value: 'USER',         label: '👤 USER — пользователь' },
                        { value: 'RELATIVE',     label: '👨‍👩‍👧 RELATIVE — опекун' },
                        { value: 'ORG_MANAGER',  label: '🏢 ORG_MANAGER' },
                        { value: 'TAXI_MANAGER', label: '🚕 TAXI_MANAGER' },
                        { value: 'MODERATOR',    label: '🛡️ MODERATOR' },
                        { value: 'ADMIN',        label: '👑 ADMIN' },
                      ],
                    },
                  },
                  actions: {
                    new:    { isAccessible: false }, // юзеров создаём только через регистрацию
                    delete: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'ADMIN' },
                  },
                },
              },

              // ── 2. Организации ───────────────────────────────────────────
              {
                resource: { model: getModelByName('Organization', coreDmmf), client: coreClient, clientModule: coreDmmf },
                options: {
                  navigation:       { name: 'Core DB', icon: 'Database' },
                  listProperties:   ['nameRu', 'category', 'status', 'city', 'ratingAvg', 'createdAt'],
                  showProperties:   ['nameRu', 'nameKk', 'category', 'status', 'description',
                                     'address', 'city', 'phone', 'email', 'website',
                                     'lat', 'lon', 'isAccessible', 'ratingAvg', 'ratingCount', 'createdAt'],
                  editProperties:   ['nameRu', 'nameKk', 'category', 'status', 'description',
                                     'address', 'city', 'phone', 'email', 'website',
                                     'lat', 'lon', 'isAccessible'],
                  filterProperties: ['status', 'category', 'city'],
                  properties: {
                    status: {
                      availableValues: [
                        { value: 'PENDING',   label: '⏳ PENDING — ждёт проверки' },
                        { value: 'VERIFIED',  label: '✅ VERIFIED — верифицирована' },
                        { value: 'REJECTED',  label: '❌ REJECTED — отклонена' },
                        { value: 'SUSPENDED', label: '⚠️ SUSPENDED — приостановлена' },
                      ],
                    },
                    category: {
                      availableValues: [
                        { value: 'REHABILITATION', label: 'Реабилитация' },
                        { value: 'EDUCATION',      label: 'Образование' },
                        { value: 'MEDICAL',        label: 'Медицина' },
                        { value: 'LEGAL',          label: 'Юридическая помощь' },
                        { value: 'SOCIAL',         label: 'Социальная помощь' },
                        { value: 'SPORT',          label: 'Спорт' },
                        { value: 'CULTURE',        label: 'Культура' },
                        { value: 'EMPLOYMENT',     label: 'Трудоустройство' },
                        { value: 'OTHER',          label: 'Другое' },
                      ],
                    },
                  },
                },
              },

              // ── 3. Новости ───────────────────────────────────────────────
              {
                resource: { model: getModelByName('News', coreDmmf), client: coreClient, clientModule: coreDmmf },
                options: {
                  navigation:       { name: 'Core DB', icon: 'Database' },
                  listProperties:   ['titleRu', 'status', 'authorId', 'likesCount', 'createdAt'],
                  showProperties:   ['titleRu', 'bodyRu', 'status', 'rejectReason',
                                     'authorId', 'imageUrl', 'likesCount', 'commentsCount',
                                     'publishedAt', 'createdAt'],
                  editProperties:   ['status', 'rejectReason'],
                  filterProperties: ['status', 'authorId'],
                  properties: {
                    bodyRu: { type: 'textarea' },
                    status: {
                      availableValues: [
                        { value: 'PENDING',   label: '⏳ PENDING — на модерации' },
                        { value: 'PUBLISHED', label: '✅ PUBLISHED — опубликовано' },
                        { value: 'REJECTED',  label: '❌ REJECTED — отклонено' },
                        { value: 'DRAFT',     label: '📝 DRAFT' },
                      ],
                    },
                  },
                  actions: { new: { isAccessible: false } },
                },
              },

              // ── 4. Комментарии к новостям ────────────────────────────────
              {
                resource: { model: getModelByName('NewsComment', coreDmmf), client: coreClient, clientModule: coreDmmf },
                options: {
                  navigation:       { name: 'Core DB', icon: 'Database' },
                  listProperties:   ['newsId', 'authorId', 'text', 'status', 'createdAt'],
                  editProperties:   ['status'],
                  filterProperties: ['status', 'newsId'],
                  properties: {
                    status: {
                      availableValues: [
                        { value: 'PENDING',   label: '⏳ PENDING' },
                        { value: 'PUBLISHED', label: '✅ PUBLISHED' },
                        { value: 'REJECTED',  label: '❌ REJECTED' },
                      ],
                    },
                  },
                  actions: { new: { isAccessible: false } },
                },
              },

              // ── 5. Тикеты (обращения в поддержку) ───────────────────────
              {
                resource: { model: getModelByName('Ticket', coreDmmf), client: coreClient, clientModule: coreDmmf },
                options: {
                  navigation:       { name: 'Core DB', icon: 'Database' },
                  listProperties:   ['subject', 'status', 'userId', 'createdAt'],
                  showProperties:   ['subject', 'body', 'status', 'userId', 'createdAt', 'updatedAt'],
                  editProperties:   ['status'],
                  filterProperties: ['status'],
                  properties: {
                    body:   { type: 'textarea' },
                    status: {
                      availableValues: [
                        { value: 'OPEN',        label: '🔓 OPEN — открыт' },
                        { value: 'IN_PROGRESS', label: '🔄 IN_PROGRESS — в работе' },
                        { value: 'RESOLVED',    label: '✅ RESOLVED — решён' },
                        { value: 'CLOSED',      label: '🔒 CLOSED — закрыт' },
                      ],
                    },
                  },
                  actions: { new: { isAccessible: false } },
                },
              },

              // ── 6. Жалобы ────────────────────────────────────────────────
              {
                resource: { model: getModelByName('Complaint', coreDmmf), client: coreClient, clientModule: coreDmmf },
                options: {
                  navigation:       { name: 'Core DB', icon: 'Database' },
                  listProperties:   ['reason', 'targetType', 'status', 'userId', 'createdAt'],
                  showProperties:   ['reason', 'description', 'targetType', 'targetId', 'status', 'userId', 'createdAt'],
                  editProperties:   ['status'],
                  filterProperties: ['status', 'targetType'],
                  properties: {
                    status: {
                      availableValues: [
                        { value: 'OPEN',         label: '🔓 OPEN' },
                        { value: 'UNDER_REVIEW',  label: '🔄 UNDER_REVIEW' },
                        { value: 'RESOLVED',     label: '✅ RESOLVED' },
                        { value: 'DISMISSED',    label: '🚫 DISMISSED' },
                      ],
                    },
                  },
                  actions: { new: { isAccessible: false } },
                },
              },

              // ════════════════════════════════════════════════════════════════
              // РЕСУРСЫ — taxi_db
              // ════════════════════════════════════════════════════════════════

              // ── 7. Заявки такси ──────────────────────────────────────────
              {
                resource: { model: getModelByName('Booking', taxiDmmf), client: taxiClient, clientModule: taxiDmmf },
                options: {
                  navigation:       { name: 'ИнваТакси DB', icon: 'Car' },
                  listProperties:   ['fromAddress', 'toAddress', 'status', 'disabilityType', 'scheduledAt', 'userId'],
                  showProperties:   ['fromAddress', 'toAddress', 'status', 'disabilityType',
                                     'note', 'cancelReason', 'userId', 'managerId', 'driverId',
                                     'scheduledAt', 'createdAt', 'updatedAt'],
                  editProperties:   ['status', 'cancelReason'],
                  filterProperties: ['status', 'disabilityType'],
                  properties: {
                    status: {
                      availableValues: [
                        { value: 'PENDING',     label: '⏳ PENDING — ждёт' },
                        { value: 'CONFIRMED',   label: '✅ CONFIRMED — подтверждено' },
                        { value: 'IN_PROGRESS', label: '🚗 IN_PROGRESS — в пути' },
                        { value: 'COMPLETED',   label: '🏁 COMPLETED — завершено' },
                        { value: 'CANCELLED',   label: '❌ CANCELLED — отменено' },
                      ],
                    },
                  },
                  actions: { new: { isAccessible: false } },
                },
              },

              // ── 8. Водители ──────────────────────────────────────────────
              {
                resource: { model: getModelByName('Driver', taxiDmmf), client: taxiClient, clientModule: taxiDmmf },
                options: {
                  navigation:       { name: 'ИнваТакси DB', icon: 'Car' },
                  listProperties:   ['firstName', 'lastName', 'phone', 'vehicleType', 'status', 'ratingAvg', 'totalTrips'],
                  showProperties:   ['firstName', 'lastName', 'phone', 'vehicleType', 'vehicleModel',
                                     'licensePlate', 'status', 'ratingAvg', 'ratingCount', 'totalTrips', 'createdAt'],
                  editProperties:   ['firstName', 'lastName', 'phone', 'vehicleType',
                                     'vehicleModel', 'licensePlate', 'status'],
                  filterProperties: ['status', 'vehicleType'],
                  properties: {
                    status: {
                      availableValues: [
                        { value: 'ACTIVE',    label: '✅ ACTIVE — работает' },
                        { value: 'INACTIVE',  label: '⏸️ INACTIVE — не работает' },
                        { value: 'SUSPENDED', label: '🚫 SUSPENDED — отстранён' },
                      ],
                    },
                    vehicleType: {
                      availableValues: [
                        { value: 'WHEELCHAIR_VAN', label: '♿ Wheelchair Van' },
                        { value: 'MINIVAN',        label: '🚐 Minivan' },
                        { value: 'SEDAN',          label: '🚗 Sedan' },
                        { value: 'OTHER',          label: 'Другое' },
                      ],
                    },
                  },
                },
              },

              // ── 9. Менеджеры такси ───────────────────────────────────────
              {
                resource: { model: getModelByName('TaxiManager', taxiDmmf), client: taxiClient, clientModule: taxiDmmf },
                options: {
                  navigation:       { name: 'ИнваТакси DB', icon: 'Car' },
                  listProperties:   ['firstName', 'lastName', 'phone', 'isActive', 'createdAt'],
                  editProperties:   ['firstName', 'lastName', 'phone', 'isActive'],
                  filterProperties: ['isActive'],
                  actions: { new: { isAccessible: false } },
                },
              },

              // ── 10. Инвайт-коды для менеджеров ──────────────────────────
              {
                resource: { model: getModelByName('ManagerInvite', taxiDmmf), client: taxiClient, clientModule: taxiDmmf },
                options: {
                  navigation:    { name: 'ИнваТакси DB', icon: 'Car' },
                  listProperties: ['code', 'usedBy', 'usedAt', 'expiresAt', 'createdAt'],
                  editProperties: [],
                  actions: {
                    edit:   { isAccessible: false },
                    delete: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'ADMIN' },
                  },
                },
              },

            ], // end resources
          }, // end adminJsOptions

          // ── Авторизация через core-svc ─────────────────────────────────────
          // Логинимся на /admin/login, проверяем роль через POST /auth/login
          auth: {
            cookieName:     'adminjs_senimdi',
            cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'senimdi-qadam-admin-2026',
            authenticate: async (email: string, password: string) => {
              try {
                const coreSvcUrl = process.env.CORE_SVC_URL || 'http://localhost:3001';
                const resp = await axios.post(`${coreSvcUrl}/auth/login`, { email, password });
                const { accessToken } = resp.data;

                // Читаем payload из JWT (без crypto-верификации — доверяем core-svc)
                const payload = JSON.parse(
                  Buffer.from(accessToken.split('.')[1], 'base64').toString('utf8'),
                );

                // Пускаем только ADMIN и MODERATOR
                if (payload.role !== 'ADMIN' && payload.role !== 'MODERATOR') {
                  return null;
                }

                return { email, role: payload.role, id: payload.sub };
              } catch {
                return null; // неверный email/пароль или нет прав
              }
            },
          },

          sessionOptions: {
            resave:            true,
            saveUninitialized: true,
            secret: process.env.ADMIN_COOKIE_SECRET || 'senimdi-qadam-admin-2026',
          },
        };
      },
    });
  }
}
