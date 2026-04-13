import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { ModerateNewsDto } from './dto/moderate-news.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ModerateCommentDto } from './dto/moderate-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // ═══ ЛЕНТА НОВОСТЕЙ ═══════════════════════════════════════════════════════

  @Get()
  @ApiOperation({ summary: 'Лента новостей. sort=latest (новые) или sort=popular (по лайкам)' })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'sort',   required: false, enum: ['latest', 'popular'] })
  list(
    @Query('limit')  limit  = 20,
    @Query('offset') offset = 0,
    @Query('sort')   sort: 'popular' | 'latest' = 'latest',
  ) {
    return this.newsService.listPublished(Number(limit), Number(offset), sort);
  }

  @Get('my/list')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Мои новости (все статусы)' })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listMy(
    @Request() req: any,
    @Query('limit')  limit  = 20,
    @Query('offset') offset = 0,
  ) {
    return this.newsService.listMy(req.user.sub, Number(limit), Number(offset));
  }

  // ═══ МОДЕРАЦИЯ НОВОСТЕЙ ═══════════════════════════════════════════════════

  @Get('moderation/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Очередь новостей на модерацию (MODERATOR/ADMIN)' })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listPending(
    @Query('limit')  limit  = 20,
    @Query('offset') offset = 0,
  ) {
    return this.newsService.listPending(Number(limit), Number(offset));
  }

  // ═══ МОДЕРАЦИЯ КОММЕНТАРИЕВ ════════════════════════════════════════════════

  @Get('moderation/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Очередь комментариев на модерацию (MODERATOR/ADMIN)' })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listPendingComments(
    @Query('limit')  limit  = 20,
    @Query('offset') offset = 0,
  ) {
    return this.newsService.listPendingComments(Number(limit), Number(offset));
  }

  @Patch('comments/:commentId/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Одобрить/отклонить комментарий (MODERATOR/ADMIN)' })
  moderateComment(
    @Param('commentId') commentId: string,
    @Body() dto: ModerateCommentDto,
    @Request() req: any,
  ) {
    return this.newsService.moderateComment(commentId, dto, req.user.role);
  }

  // ═══ КОНКРЕТНАЯ НОВОСТЬ ════════════════════════════════════════════════════

  @Get(':id')
  @ApiOperation({ summary: 'Полная карточка новости' })
  getOne(@Param('id') id: string) {
    return this.newsService.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Создать новость → статус PENDING до модерации' })
  create(@Body() dto: CreateNewsDto, @Request() req: any) {
    return this.newsService.create(dto, req.user.sub);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Загрузить фото к новости (jpg/png/webp, макс 5MB)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/news',
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        // Проверяем и MIME-тип (из Content-Type) И расширение файла.
        // Только расширение — небезопасно: можно загрузить evil.php.jpg
        const allowedMime = /^image\/(jpeg|png|webp)$/;
        const allowedExt  = /\.(jpg|jpeg|png|webp)$/i;
        if (!allowedMime.test(file.mimetype) || !allowedExt.test(file.originalname)) {
          return cb(new Error('Только JPG, PNG или WebP'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.newsService.updateImage(id, req.user.sub, file.filename);
  }

  @Patch(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Модерировать новость → PUBLISHED или REJECTED' })
  moderate(
    @Param('id') id: string,
    @Body() dto: ModerateNewsDto,
    @Request() req: any,
  ) {
    return this.newsService.moderate(id, dto, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Удалить новость (автор или ADMIN)' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.newsService.remove(id, req.user.sub, req.user.role);
  }

  // ═══ ЛАЙКИ ════════════════════════════════════════════════════════════════

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Поставить / убрать лайк (toggle)' })
  toggleLike(@Param('id') id: string, @Request() req: any) {
    return this.newsService.toggleLike(id, req.user.sub);
  }

  // ═══ КОММЕНТАРИИ ══════════════════════════════════════════════════════════

  @Get(':id/comments')
  @ApiOperation({ summary: 'Список одобренных комментариев к новости (публичный)' })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listComments(
    @Param('id') id: string,
    @Query('limit')  limit  = 20,
    @Query('offset') offset = 0,
  ) {
    return this.newsService.listComments(id, Number(limit), Number(offset));
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Написать комментарий → статус PENDING до модерации' })
  createComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.newsService.createComment(id, req.user.sub, dto);
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Удалить комментарий (свой, или MODERATOR/ADMIN)' })
  deleteComment(
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    return this.newsService.deleteComment(commentId, req.user.sub, req.user.role);
  }
}
