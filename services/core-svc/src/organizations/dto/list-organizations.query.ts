import { Transform } from 'class-transformer';
import { IsBooleanString, IsOptional, IsString } from 'class-validator';

export class ListOrganizationsQuery {
  // Поиск по названию (nameRu)
  @IsOptional()
  @IsString()
  q?: string;

  // Фильтр по категории (OrgCategory enum): REHABILITATION | EDUCATION | MEDICAL | LEGAL | SOCIAL | SPORT | CULTURE | EMPLOYMENT | OTHER
  @IsOptional()
  @IsString()
  category?: string;

  // Фильтр по городу
  @IsOptional()
  @IsString()
  city?: string;

  // Только верифицированные (status = VERIFIED)
  @IsOptional()
  @IsBooleanString()
  verified?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  offset?: number;
}
