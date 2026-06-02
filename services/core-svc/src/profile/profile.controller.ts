import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { MinioService } from '../minio/minio.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RequestLinkDto } from './dto/request-link.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly minio: MinioService,
  ) {}

  // ═══ ПРИВАТНЫЕ (только свой профиль) ════════════════════════════════════

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Мой полный профиль (приватный)' })
  getMe(@Request() req: any) {
    return this.profileService.getMyProfile(req.user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Обновить профиль → инвалидирует кэш' })
  updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.sub, dto, req.user.role);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Загрузить аватар (jpg/png/webp, max 5MB) — хранится в MinIO' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // файл хранится в RAM — затем загружаем в MinIO
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
          // BadRequestException (а не голый Error) → Nest вернёт 400, а не 500.
          return cb(new BadRequestException('Только JPG, PNG или WebP'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не загружен');
    const url = await this.minio.upload(
      MinioService.BUCKET_AVATARS,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
    return this.profileService.updateAvatar(req.user.sub, url);
  }

  @Patch('me/location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Обновить мою геолокацию (lat, lon)' })
  updateLocation(@Request() req: any, @Body() dto: UpdateLocationDto) {
    return this.profileService.updateLocation(req.user.sub, dto.lat, dto.lon);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Деактивировать аккаунт' })
  deactivate(@Request() req: any) {
    return this.profileService.deactivate(req.user.sub);
  }

  // ═══ ACCESSIBILITY PREFERENCES ═══════════════════════════════════════════

  @Get('me/accessibility')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Получить настройки доступности' })
  getAccessibility(@Request() req: any) {
    return this.profileService.getAccessibilityPrefs(req.user.sub);
  }

  @Patch('me/accessibility')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Обновить настройки доступности (fontSize, contrast, tts, etc.)' })
  @HttpCode(HttpStatus.OK)
  updateAccessibility(@Request() req: any, @Body() prefs: Record<string, any>) {
    return this.profileService.updateAccessibilityPrefs(req.user.sub, prefs);
  }

  // ═══ МОИ ЛАЙКИ ═══════════════════════════════════════════════════════════

  @Get('me/liked-news')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Новости которые я лайкнул' })
  getLikedNews(@Request() req: any) {
    return this.profileService.getLikedNews(req.user.sub);
  }

  @Get('me/liked-guides')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Гайды которые я лайкнул' })
  getLikedGuides(@Request() req: any) {
    return this.profileService.getLikedGuides(req.user.sub);
  }

  // ═══ FCM DEVICE TOKEN ════════════════════════════════════════════════════

  @Post('me/device-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Зарегистрировать FCM токен для push-уведомлений' })
  registerDevice(@Request() req: any, @Body() dto: RegisterDeviceDto) {
    return this.profileService.registerDevice(req.user.sub, dto.token, dto.platform);
  }

  @Delete('me/device-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Удалить FCM токен (при выходе из приложения)' })
  unregisterDevice(@Request() req: any, @Body() dto: RegisterDeviceDto) {
    return this.profileService.unregisterDevice(req.user.sub, dto.token);
  }

  // ═══ МОИ СОХРАНЁННЫЕ ОРГАНИЗАЦИИ ════════════════════════════════════════

  // ═══ ПУБЛИЧНЫЙ профиль ═══════════════════════════════════════════════════

  @Get(':id')
  @ApiOperation({ summary: 'Публичный профиль — кэшируется Redis 5 мин' })
  getPublic(@Param('id') id: string) {
    return this.profileService.getPublicProfile(id);
  }

  // ═══ RELATIVE LINKS ══════════════════════════════════════════════════════

  @Post('links/request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'RELATIVE: отправить запрос на связку' })
  requestLink(@Request() req: any, @Body() dto: RequestLinkDto) {
    return this.profileService.requestLink(req.user.sub, dto);
  }

  @Post('links/accept/:linkId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'USER: принять запрос от родственника' })
  acceptLink(@Request() req: any, @Param('linkId') linkId: string) {
    return this.profileService.acceptLink(req.user.sub, linkId);
  }

  @Get('links/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Мои связки (как опекун и как опекаемый)' })
  getLinks(@Request() req: any) {
    return this.profileService.getMyLinks(req.user.sub);
  }

  @Delete('links/:linkId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Удалить связку' })
  removeLink(@Request() req: any, @Param('linkId') linkId: string) {
    return this.profileService.removeLink(req.user.sub, linkId);
  }
}
