import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminUsersService } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('admin / users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly svc: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'Список всех пользователей' })
  @ApiQuery({ name: 'q',        required: false, description: 'Поиск по email' })
  @ApiQuery({ name: 'role',     enum: Role, required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'limit',    required: false })
  @ApiQuery({ name: 'offset',   required: false })
  findAll(
    @Query('q')        q?: string,
    @Query('role')     role?: Role,
    @Query('isActive') isActive?: string,
    @Query('limit')    limit = '50',
    @Query('offset')   offset = '0',
  ) {
    return this.svc.findAll({
      q, role,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      limit: +limit, offset: +offset,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Профиль пользователя' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Изменить роль пользователя (только ADMIN)' })
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.svc.updateRole(id, dto.role);
  }

  @Patch(':id/ban')
  @ApiOperation({ summary: 'Заблокировать / разблокировать пользователя' })
  toggleBan(@Param('id') id: string) {
    return this.svc.toggleBan(id);
  }
}
