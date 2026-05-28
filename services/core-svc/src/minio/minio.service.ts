import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import * as sharp from 'sharp';
import { extname } from 'path';
import { randomUUID } from 'crypto';

// ── Image optimization config ─────────────────────────────────────────────────
const IMAGE_MAX_WIDTH  = 1200; // px — max output width
const AVATAR_MAX_WIDTH = 400;  // px — avatars are always small
const WEBP_QUALITY     = 82;   // % — good balance size/quality

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client: Minio.Client;

  // Бакеты
  static readonly BUCKET_AVATARS = 'avatars';
  static readonly BUCKET_NEWS    = 'news';

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.client = new Minio.Client({
      endPoint:  this.config.get<string>('MINIO_ENDPOINT')  ?? 'localhost',
      port:      Number(this.config.get('MINIO_PORT') ?? 9000),
      useSSL:    this.config.get('MINIO_USE_SSL') === 'true',
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY') ?? 'minioadmin',
      secretKey: this.config.get<string>('MINIO_SECRET_KEY') ?? 'minioadmin',
    });

    // Создаём бакеты при старте (если не существуют)
    void this.ensureBuckets();
  }

  // ── Создание бакетов с публичной политикой чтения ─────────────────────────
  private async ensureBuckets() {
    for (const bucket of [MinioService.BUCKET_AVATARS, MinioService.BUCKET_NEWS]) {
      try {
        const exists = await this.client.bucketExists(bucket);
        if (!exists) {
          await this.client.makeBucket(bucket);
          await this.setPublicReadPolicy(bucket);
          this.logger.log(`Бакет "${bucket}" создан`);
        }
      } catch (err) {
        this.logger.warn(`Не удалось создать бакет "${bucket}": ${err}`);
      }
    }
  }

  private async setPublicReadPolicy(bucket: string) {
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect:    'Allow',
          Principal: { AWS: ['*'] },
          Action:    ['s3:GetObject'],
          Resource:  [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    });
    await this.client.setBucketPolicy(bucket, policy);
  }

  // ── Загрузить файл → вернуть публичный URL ────────────────────────────────
  async upload(
    bucket: string,
    buffer: Buffer,
    originalName: string,
    mimetype: string,
  ): Promise<string> {
    let finalBuffer  = buffer;
    let finalMime    = mimetype;
    let finalExt     = extname(originalName) || '.bin';

    // ── Sharp optimization for image uploads ───────────────────────────────
    if (mimetype.startsWith('image/') && mimetype !== 'image/gif') {
      try {
        const isAvatar  = bucket === MinioService.BUCKET_AVATARS;
        const maxWidth  = isAvatar ? AVATAR_MAX_WIDTH : IMAGE_MAX_WIDTH;

        finalBuffer = await sharp(buffer)
          .resize({ width: maxWidth, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer();

        finalMime = 'image/webp';
        finalExt  = '.webp';
        this.logger.debug(
          `Image optimized: ${buffer.length} → ${finalBuffer.length} bytes (${Math.round((1 - finalBuffer.length / buffer.length) * 100)}% saved)`,
        );
      } catch (err) {
        // Non-critical — fall back to original buffer
        this.logger.warn(`Sharp optimization failed, uploading original: ${err}`);
        finalBuffer = buffer;
        finalMime   = mimetype;
        finalExt    = extname(originalName) || '.bin';
      }
    }

    const objectName = `${randomUUID()}${finalExt}`;

    await this.client.putObject(bucket, objectName, finalBuffer, finalBuffer.length, {
      'Content-Type': finalMime,
    });

    return this.publicUrl(bucket, objectName);
  }

  // ── Удалить объект (при замене аватара / удалении новости) ────────────────
  async remove(bucket: string, objectName: string): Promise<void> {
    try {
      await this.client.removeObject(bucket, objectName);
    } catch (err) {
      this.logger.warn(`Не удалось удалить объект "${objectName}": ${err}`);
    }
  }

  // ── Публичный URL файла ───────────────────────────────────────────────────
  publicUrl(bucket: string, objectName: string): string {
    const base = this.config.get<string>('MINIO_PUBLIC_URL') ?? 'http://localhost:9000';
    return `${base}/${bucket}/${objectName}`;
  }

  /** Извлекает objectName из URL вида {publicUrl}/{bucket}/{objectName} */
  static objectNameFromUrl(url: string): string | null {
    try {
      const parts = new URL(url).pathname.split('/').filter(Boolean);
      // pathname = /{bucket}/{objectName}  → parts[0]=bucket, parts[1]=name
      return parts.length >= 2 ? parts.slice(1).join('/') : null;
    } catch {
      return null;
    }
  }
}
