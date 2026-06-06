-- =====================================================================
-- SenimdiQadam — ДЕМО-ДАННЫЕ для core_db
-- Пользователи, новости, гайды, отзывы, жалобы, тикеты, уведомления и т.д.
-- Безопасно запускать повторно (ON CONFLICT DO NOTHING).
-- Пароль всех демо-пользователей: Demo@123456
-- =====================================================================
BEGIN;

-- ── Демо-пользователи (пароль Demo@123456) ───────────────────────────
INSERT INTO "User" (id,email,"passwordHash",role,"isVerified","isActive","createdAt","updatedAt") VALUES
 ('11111111-1111-1111-1111-111111111101','aigerim.demo@senimdi.kz','$2b$12$N6Va7a3uAnz9LdaYCoxIC.k44ww0.Ky261zosQrrtpCRh.lzl5gOq','USER',true,true,now(),now()),
 ('11111111-1111-1111-1111-111111111102','marat.demo@senimdi.kz','$2b$12$N6Va7a3uAnz9LdaYCoxIC.k44ww0.Ky261zosQrrtpCRh.lzl5gOq','RELATIVE',true,true,now(),now()),
 ('11111111-1111-1111-1111-111111111103','dana.demo@senimdi.kz','$2b$12$N6Va7a3uAnz9LdaYCoxIC.k44ww0.Ky261zosQrrtpCRh.lzl5gOq','USER',true,true,now(),now()),
 ('11111111-1111-1111-1111-111111111104','arman.demo@senimdi.kz','$2b$12$N6Va7a3uAnz9LdaYCoxIC.k44ww0.Ky261zosQrrtpCRh.lzl5gOq','USER',true,true,now(),now()),
 -- Привилегированные роли
 ('11111111-1111-1111-1111-111111111105','admin.demo@senimdi.kz','$2b$12$N6Va7a3uAnz9LdaYCoxIC.k44ww0.Ky261zosQrrtpCRh.lzl5gOq','ADMIN',true,true,now(),now()),
 ('11111111-1111-1111-1111-111111111106','moderator.demo@senimdi.kz','$2b$12$N6Va7a3uAnz9LdaYCoxIC.k44ww0.Ky261zosQrrtpCRh.lzl5gOq','MODERATOR',true,true,now(),now()),
 ('11111111-1111-1111-1111-111111111107','taxi.demo@senimdi.kz','$2b$12$N6Va7a3uAnz9LdaYCoxIC.k44ww0.Ky261zosQrrtpCRh.lzl5gOq','TAXI_MANAGER',true,true,now(),now()),
 ('11111111-1111-1111-1111-111111111108','org.manager.demo@senimdi.kz','$2b$12$N6Va7a3uAnz9LdaYCoxIC.k44ww0.Ky261zosQrrtpCRh.lzl5gOq','ORG_MANAGER',true,true,now(),now())
ON CONFLICT (email) DO NOTHING;

-- ── Профили ──────────────────────────────────────────────────────────
INSERT INTO "UserProfile" (id,"userId","firstName","lastName",phone,city,"disabilityType","disabilityNote",lat,lon,"createdAt","updatedAt") VALUES
 ('11111111-1111-1111-1111-111111112101','11111111-1111-1111-1111-111111111101','Айгерим','Сатпаева','+7 701 111 1101','Алматы','MOBILITY','Передвигается на коляске',43.238,76.945,now(),now()),
 ('11111111-1111-1111-1111-111111112102','11111111-1111-1111-1111-111111111102','Марат','Алиев','+7 701 111 1102','Алматы',NULL,NULL,43.245,76.91,now(),now()),
 ('11111111-1111-1111-1111-111111112103','11111111-1111-1111-1111-111111111103','Дана','Кенжебек','+7 701 111 1103','Алматы','VISUAL','Нарушение зрения',43.25,76.95,now(),now()),
 ('11111111-1111-1111-1111-111111112104','11111111-1111-1111-1111-111111111104','Арман','Болат','+7 701 111 1104','Алматы','HEARING',NULL,43.22,76.93,now(),now()),
 ('11111111-1111-1111-1111-111111112105','11111111-1111-1111-1111-111111111105','Админ','Демо','+7 701 111 1105','Алматы',NULL,NULL,43.24,76.92,now(),now()),
 ('11111111-1111-1111-1111-111111112106','11111111-1111-1111-1111-111111111106','Модератор','Демо','+7 701 111 1106','Алматы',NULL,NULL,43.24,76.92,now(),now()),
 ('11111111-1111-1111-1111-111111112107','11111111-1111-1111-1111-111111111107','Такси','Менеджер','+7 701 111 1107','Алматы',NULL,NULL,43.24,76.92,now(),now()),
 ('11111111-1111-1111-1111-111111112108','11111111-1111-1111-1111-111111111108','Орг','Менеджер','+7 701 111 1108','Алматы',NULL,NULL,43.24,76.92,now(),now())
ON CONFLICT ("userId") DO NOTHING;

-- ── Назначить менеджера первой организации ────────────────────────────
UPDATE "Organization" SET "managerId" = '11111111-1111-1111-1111-111111111108'
WHERE id = (SELECT id FROM "Organization" ORDER BY "createdAt" LIMIT 1)
  AND "managerId" IS NULL;

-- ── Связь опекун → подопечный ────────────────────────────────────────
INSERT INTO "RelativeLink" (id,"guardianId","dependentId",label,"isAccepted","createdAt") VALUES
 ('11111111-1111-1111-1111-111111119101','11111111-1111-1111-1111-111111111102','11111111-1111-1111-1111-111111111101','Дочь',true,now())
ON CONFLICT ("guardianId","dependentId") DO NOTHING;

-- ── Новости (опубликованы) ───────────────────────────────────────────
INSERT INTO "News" (id,"authorId","titleRu","bodyRu",status,"publishedAt","likesCount","commentsCount","createdAt","updatedAt") VALUES
 ('11111111-1111-1111-1111-111111113101','11111111-1111-1111-1111-111111111101','В Алматы открылся новый центр реабилитации','Сегодня в Бостандыкском районе открылся современный центр реабилитации для детей с ОВЗ. Доступная среда, пандусы, лифты и квалифицированные специалисты ждут посетителей.','PUBLISHED',now(),2,2,now(),now()),
 ('11111111-1111-1111-1111-111111113102','11111111-1111-1111-1111-111111111103','Бесплатные курсы жестового языка','Городской центр запускает бесплатные курсы казахского жестового языка для всех желающих. Запись открыта до конца месяца.','PUBLISHED',now(),1,1,now(),now()),
 ('11111111-1111-1111-1111-111111113103','11111111-1111-1111-1111-111111111104','Инклюзивный фестиваль «Сенімді қадам»','В эти выходные пройдёт инклюзивный фестиваль с мастер-классами, концертом и спортивными активностями. Вход свободный.','PUBLISHED',now(),3,0,now(),now()),
 ('11111111-1111-1111-1111-111111113104','11111111-1111-1111-1111-111111111102','Как оформить инвалидность: пошаговая инструкция','Разбираем по шагам, какие документы нужны и куда обращаться для оформления группы инвалидности в 2026 году.','PUBLISHED',now(),5,1,now(),now()),
 ('11111111-1111-1111-1111-111111113105','11111111-1111-1111-1111-111111111101','Запущена служба инватакси','Теперь заказать специализированное такси с подъёмником можно прямо в приложении. Поездки по городу доступны ежедневно.','PUBLISHED',now(),4,0,now(),now()),
 ('11111111-1111-1111-1111-111111113106','11111111-1111-1111-1111-111111111103','Истории успеха: спорт без границ','Знакомим вас с паралимпийцами из Алматы, которые доказывают, что спорт доступен каждому.','PUBLISHED',now(),1,0,now(),now())
ON CONFLICT (id) DO NOTHING;

-- ── Комментарии к новостям (одобрены) ────────────────────────────────
INSERT INTO "NewsComment" (id,"newsId","authorId",text,status,"createdAt","updatedAt") VALUES
 ('11111111-1111-1111-1111-111111114101','11111111-1111-1111-1111-111111113101','11111111-1111-1111-1111-111111111103','Отличная новость! Давно ждали такой центр.','PUBLISHED',now(),now()),
 ('11111111-1111-1111-1111-111111114102','11111111-1111-1111-1111-111111113101','11111111-1111-1111-1111-111111111104','А есть ли парковка для инвалидов рядом?','PUBLISHED',now(),now()),
 ('11111111-1111-1111-1111-111111114103','11111111-1111-1111-1111-111111113102','11111111-1111-1111-1111-111111111101','Записалась, спасибо за информацию!','PUBLISHED',now(),now()),
 ('11111111-1111-1111-1111-111111114104','11111111-1111-1111-1111-111111113104','11111111-1111-1111-1111-111111111101','Очень полезно, сохранил в закладки.','PUBLISHED',now(),now())
ON CONFLICT (id) DO NOTHING;

-- ── Лайки новостей ───────────────────────────────────────────────────
INSERT INTO "NewsLike" (id,"newsId","userId","createdAt") VALUES
 ('11111111-1111-1111-1111-111111115101','11111111-1111-1111-1111-111111113101','11111111-1111-1111-1111-111111111103',now()),
 ('11111111-1111-1111-1111-111111115102','11111111-1111-1111-1111-111111113101','11111111-1111-1111-1111-111111111104',now()),
 ('11111111-1111-1111-1111-111111115103','11111111-1111-1111-1111-111111113104','11111111-1111-1111-1111-111111111103',now())
ON CONFLICT ("newsId","userId") DO NOTHING;

-- ── Гайды (опубликованы) ─────────────────────────────────────────────
INSERT INTO "Guide" (id,"titleRu","bodyRu",category,tags,"isPublished","authorId","likesCount","createdAt","updatedAt") VALUES
 ('11111111-1111-1111-1111-111111116101','Как получить техническое средство реабилитации','Пошаговая инструкция по получению коляски, слухового аппарата и других ТСР через портал электронного правительства.','Документы',ARRAY['ТСР','документы','льготы'],true,'11111111-1111-1111-1111-111111111102',3,now(),now()),
 ('11111111-1111-1111-1111-111111116102','Доступная среда: ваши права','Что делать, если в здании нет пандуса или лифта. Куда жаловаться и как добиться доступности.','Права',ARRAY['права','доступность'],true,'11111111-1111-1111-1111-111111111103',2,now(),now()),
 ('11111111-1111-1111-1111-111111116103','Льготы и пособия в 2026 году','Полный список социальных выплат и льгот для людей с инвалидностью и их семей.','Льготы',ARRAY['льготы','пособия','выплаты'],true,'11111111-1111-1111-1111-111111111102',5,now(),now()),
 ('11111111-1111-1111-1111-111111116104','Как пользоваться инватакси','Инструкция по заказу специализированного такси: от выбора адреса до оплаты.','Транспорт',ARRAY['такси','транспорт'],true,'11111111-1111-1111-1111-111111111101',1,now(),now()),
 ('11111111-1111-1111-1111-111111116105','Психологическая поддержка: куда обратиться','Список бесплатных психологических служб и горячих линий в Алматы.','Здоровье',ARRAY['психология','поддержка'],true,'11111111-1111-1111-1111-111111111104',2,now(),now())
ON CONFLICT (id) DO NOTHING;

-- ── Лайки гайдов ─────────────────────────────────────────────────────
INSERT INTO "GuideLike" (id,"guideId","userId","createdAt") VALUES
 ('11111111-1111-1111-1111-111111117101','11111111-1111-1111-1111-111111116103','11111111-1111-1111-1111-111111111101',now()),
 ('11111111-1111-1111-1111-111111117102','11111111-1111-1111-1111-111111116103','11111111-1111-1111-1111-111111111103',now())
ON CONFLICT ("guideId","userId") DO NOTHING;

-- ── Отзывы на организации (берём 5 первых организаций) ────────────────
INSERT INTO "OrgReview" (id,"organizationId","userId",rating,comment,"isVerified","createdAt","updatedAt")
SELECT '11111111-1111-1111-1111-11111111a101', id, '11111111-1111-1111-1111-111111111101', 5, 'Прекрасные специалисты, очень помогли ребёнку.', true, now(), now()
FROM "Organization" ORDER BY "createdAt" LIMIT 1 OFFSET 0
ON CONFLICT ("organizationId","userId") DO NOTHING;
INSERT INTO "OrgReview" (id,"organizationId","userId",rating,comment,"isVerified","createdAt","updatedAt")
SELECT '11111111-1111-1111-1111-11111111a102', id, '11111111-1111-1111-1111-111111111103', 4, 'Хороший центр, но запись плотная.', true, now(), now()
FROM "Organization" ORDER BY "createdAt" LIMIT 1 OFFSET 1
ON CONFLICT ("organizationId","userId") DO NOTHING;
INSERT INTO "OrgReview" (id,"organizationId","userId",rating,comment,"isVerified","createdAt","updatedAt")
SELECT '11111111-1111-1111-1111-11111111a103', id, '11111111-1111-1111-1111-111111111104', 5, 'Доброжелательный персонал и доступная среда.', true, now(), now()
FROM "Organization" ORDER BY "createdAt" LIMIT 1 OFFSET 2
ON CONFLICT ("organizationId","userId") DO NOTHING;
INSERT INTO "OrgReview" (id,"organizationId","userId",rating,comment,"isVerified","createdAt","updatedAt")
SELECT '11111111-1111-1111-1111-11111111a104', id, '11111111-1111-1111-1111-111111111101', 4, 'Рекомендую, результат заметен.', true, now(), now()
FROM "Organization" ORDER BY "createdAt" LIMIT 1 OFFSET 3
ON CONFLICT ("organizationId","userId") DO NOTHING;
INSERT INTO "OrgReview" (id,"organizationId","userId",rating,comment,"isVerified","createdAt","updatedAt")
SELECT '11111111-1111-1111-1111-11111111a105', id, '11111111-1111-1111-1111-111111111103', 5, 'Спасибо за заботу и профессионализм!', true, now(), now()
FROM "Organization" ORDER BY "createdAt" LIMIT 1 OFFSET 4
ON CONFLICT ("organizationId","userId") DO NOTHING;

-- Пересчитать рейтинг организаций
UPDATE "Organization" o SET "ratingCount" = s.cnt, "ratingAvg" = s.avg
FROM (SELECT "organizationId" oid, COUNT(*) cnt, ROUND(AVG(rating)::numeric,2) avg
      FROM "OrgReview" GROUP BY "organizationId") s
WHERE o.id = s.oid;

-- ── Услуги организаций ───────────────────────────────────────────────
INSERT INTO "OrgService" (id,"organizationId","nameRu","descriptionRu","isActive",price,"createdAt","updatedAt")
SELECT '11111111-1111-1111-1111-11111111b101', id, 'Консультация дефектолога', 'Индивидуальное занятие 45 минут', true, 8000, now(), now()
FROM "Organization" ORDER BY "createdAt" LIMIT 1 OFFSET 0
ON CONFLICT (id) DO NOTHING;
INSERT INTO "OrgService" (id,"organizationId","nameRu","descriptionRu","isActive",price,"createdAt","updatedAt")
SELECT '11111111-1111-1111-1111-11111111b102', id, 'Групповые занятия ЛФК', 'Лечебная физкультура в группе', true, 0, now(), now()
FROM "Organization" ORDER BY "createdAt" LIMIT 1 OFFSET 0
ON CONFLICT (id) DO NOTHING;

-- ── Жалобы ───────────────────────────────────────────────────────────
INSERT INTO "Complaint" (id,"userId","targetType","targetId",reason,description,status,"createdAt","updatedAt") VALUES
 ('11111111-1111-1111-1111-11111111c101','11111111-1111-1111-1111-111111111101','Organization','unknown','Нет пандуса','В здании отсутствует пандус, невозможно заехать на коляске.','OPEN',now(),now()),
 ('11111111-1111-1111-1111-11111111c102','11111111-1111-1111-1111-111111111103','News','11111111-1111-1111-1111-111111113103','Недостоверная информация','Указаны неверные даты проведения фестиваля.','UNDER_REVIEW',now(),now())
ON CONFLICT (id) DO NOTHING;

-- ── Тикеты поддержки ─────────────────────────────────────────────────
INSERT INTO "Ticket" (id,"userId",subject,body,status,"createdAt","updatedAt") VALUES
 ('11111111-1111-1111-1111-11111111d101','11111111-1111-1111-1111-111111111101','Не приходит код подтверждения','Регистрируюсь, но письмо с подтверждением не приходит на почту.','OPEN',now(),now()),
 ('11111111-1111-1111-1111-11111111d102','11111111-1111-1111-1111-111111111104','Как изменить адрес?','Подскажите, где в профиле поменять адрес проживания.','IN_PROGRESS',now(),now()),
 ('11111111-1111-1111-1111-11111111d103','11111111-1111-1111-1111-111111111103','Спасибо за приложение','Очень удобно, нашла нужный центр за пару минут!','RESOLVED',now(),now())
ON CONFLICT (id) DO NOTHING;

-- ── Отзывы на специалистов (target = admin) ──────────────────────────
INSERT INTO "SpecialistReview" (id,"targetUserId","authorId",rating,comment,"isVerified","createdAt","updatedAt")
SELECT '11111111-1111-1111-1111-11111111e101', u.id, '11111111-1111-1111-1111-111111111101', 5, 'Внимательный специалист, всё подробно объяснил.', true, now(), now()
FROM "User" u WHERE u.role='ADMIN' LIMIT 1
ON CONFLICT ("targetUserId","authorId") DO NOTHING;
INSERT INTO "SpecialistReview" (id,"targetUserId","authorId",rating,comment,"isVerified","createdAt","updatedAt")
SELECT '11111111-1111-1111-1111-11111111e102', u.id, '11111111-1111-1111-1111-111111111103', 4, 'Хороший приём, рекомендую.', true, now(), now()
FROM "User" u WHERE u.role='ADMIN' LIMIT 1
ON CONFLICT ("targetUserId","authorId") DO NOTHING;

-- ── Уведомления ──────────────────────────────────────────────────────
INSERT INTO "Notification" (id,"userId",title,body,type,data,"isRead","createdAt") VALUES
 ('11111111-1111-1111-1111-11111111f101','11111111-1111-1111-1111-111111111101','Новость опубликована','Ваша новость прошла модерацию и опубликована.','news_published','{"newsId":"11111111-1111-1111-1111-111111113101"}'::jsonb,false,now()),
 ('11111111-1111-1111-1111-11111111f102','11111111-1111-1111-1111-111111111101','Заявка подтверждена','Ваша заявка на инватакси подтверждена, водитель назначен.','booking_confirmed','{}'::jsonb,false,now()),
 ('11111111-1111-1111-1111-11111111f103','11111111-1111-1111-1111-111111111103','Новый отзыв','На вашу организацию оставили новый отзыв.','org_review',NULL,true,now()),
 ('11111111-1111-1111-1111-11111111f104',NULL,'Обновление приложения','Доступна новая версия с улучшенной доступностью. Обновитесь!','broadcast',NULL,false,now())
ON CONFLICT (id) DO NOTHING;

-- ── Сохранённые организации (избранное) ──────────────────────────────
INSERT INTO "SavedOrganization" (id,"userId","organizationId","createdAt")
SELECT '11111111-1111-1111-1111-11111111aa01', '11111111-1111-1111-1111-111111111101', id, now()
FROM "Organization" ORDER BY "createdAt" LIMIT 1 OFFSET 0
ON CONFLICT ("userId","organizationId") DO NOTHING;
INSERT INTO "SavedOrganization" (id,"userId","organizationId","createdAt")
SELECT '11111111-1111-1111-1111-11111111aa02', '11111111-1111-1111-1111-111111111103', id, now()
FROM "Organization" ORDER BY "createdAt" LIMIT 1 OFFSET 2
ON CONFLICT ("userId","organizationId") DO NOTHING;

COMMIT;
