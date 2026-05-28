import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Generic cursor-based pagination DTO.
 *
 * Usage:
 *   GET /news?limit=20&cursor=<lastItemId>
 *
 * Response shape:
 *   { items: [...], nextCursor: "<id>" | null }
 *
 * nextCursor is null when there are no more pages.
 */
export class CursorPaginationDto {
  @ApiPropertyOptional({ description: 'ID последнего элемента предыдущей страницы (cursor)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

/**
 * Build a paginated response with nextCursor.
 * items should have one extra element loaded (limit+1) to detect if there's a next page.
 */
export function buildCursorPage<T extends { id: string }>(
  items: T[],
  limit: number,
): { items: T[]; nextCursor: string | null } {
  const hasNext = items.length > limit;
  const page = hasNext ? items.slice(0, limit) : items;
  const nextCursor = hasNext ? page[page.length - 1].id : null;
  return { items: page, nextCursor };
}
