import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateOrgReviewDto } from './dto/create-org-review.dto';
import { CreateSpecialistReviewDto } from './dto/create-specialist-review.dto';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ── Отзывы на организации ────────────────────────────────────────────────

  @Post('organizations/:id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Оставить отзыв на организацию (auth)' })
  createOrgReview(
    @Param('id') organizationId: string,
    @Request() req: any,
    @Body() dto: CreateOrgReviewDto,
  ) {
    return this.reviewsService.createOrgReview(organizationId, req.user.sub, dto);
  }

  @Get('organizations/:id/reviews')
  @ApiOperation({ summary: 'Список отзывов на организацию (публичный)' })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listOrgReviews(
    @Param('id') organizationId: string,
    @Query('limit')  limit  = 20,
    @Query('offset') offset = 0,
  ) {
    return this.reviewsService.listOrgReviews(
      organizationId,
      Number(limit),
      Number(offset),
    );
  }

  // ── Отзывы на специалистов ───────────────────────────────────────────────

  @Post('specialists/:id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Оставить отзыв на специалиста (auth)' })
  createSpecialistReview(
    @Param('id') targetUserId: string,
    @Request() req: any,
    @Body() dto: CreateSpecialistReviewDto,
  ) {
    return this.reviewsService.createSpecialistReview(
      targetUserId,
      req.user.sub,
      dto,
    );
  }

  @Get('specialists/:id/reviews')
  @ApiOperation({ summary: 'Список отзывов на специалиста (публичный)' })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listSpecialistReviews(
    @Param('id') targetUserId: string,
    @Query('limit')  limit  = 20,
    @Query('offset') offset = 0,
  ) {
    return this.reviewsService.listSpecialistReviews(
      targetUserId,
      Number(limit),
      Number(offset),
    );
  }
}
