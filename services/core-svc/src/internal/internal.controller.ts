/**
 * Internal-only controller — used for service-to-service calls.
 * Double protection:
 *   1. X-Internal-Key header must match ADMIN_KEY env var
 *   2. Request IP must be in RFC1918 private range (Docker internal network)
 *
 * Never expose this to the public internet.
 */
import {
  Controller,
  Patch,
  Param,
  Headers,
  Req,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

/**
 * Проверяет что IP адрес принадлежит приватной сети RFC1918.
 * Docker internal networks используют 172.16.0.0/12 (по умолчанию).
 * Также допускаем 10.0.0.0/8, 192.168.0.0/16 и localhost.
 */
function isInternalIp(ip: string): boolean {
  // Убираем IPv6 wrapper если есть (::ffff:172.x.x.x)
  const normalized = ip.replace(/^::ffff:/, '');
  if (normalized === '127.0.0.1' || normalized === '::1') return true;

  const parts = normalized.split('.').map(Number);
  if (parts.length !== 4) return false;
  const [a, b] = parts;

  return (
    a === 10 ||                                    // 10.0.0.0/8
    (a === 172 && b >= 16 && b <= 31) ||           // 172.16.0.0/12
    (a === 192 && b === 168)                        // 192.168.0.0/16
  );
}

@ApiExcludeController()
@Controller('internal')
export class InternalController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * PATCH /internal/users/:id/promote-taxi-manager
   * Called by taxi-svc after a manager registers with an invite code.
   * Sets the user's role to TAXI_MANAGER in core_db.
   */
  @Patch('users/:id/promote-taxi-manager')
  async promoteToTaxiManager(
    @Param('id') userId: string,
    @Headers('x-internal-key') key: string,
    @Req() req: Request,
  ) {
    // 1. IP allowlist — только внутренние Docker сети
    const clientIp = (req.ip || req.socket?.remoteAddress || '');
    if (!isInternalIp(clientIp)) {
      throw new ForbiddenException(`Access denied from external IP: ${clientIp}`);
    }

    // 2. Shared secret
    if (!key || key !== process.env.ADMIN_KEY) {
      throw new UnauthorizedException('Invalid internal key');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.TAXI_MANAGER },
    });

    return { success: true, userId, role: Role.TAXI_MANAGER };
  }
}
