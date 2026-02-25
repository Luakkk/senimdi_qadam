import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request & { headers: any }>();

    const adminKey = req.headers['x-admin-key'];
    const role = req.headers['x-role'];

    const expected = process.env.ADMIN_KEY;

    if (!expected) {
      // чтобы не “тихо” пропускать без ключа, это безопаснее
      throw new ForbiddenException('ADMIN_KEY is not set on server');
    }

    if (adminKey !== expected) {
      throw new ForbiddenException('Invalid x-admin-key');
    }

    // опционально (но красиво): требуем роль ADMIN
    if (role && String(role).toUpperCase() !== 'ADMIN') {
      throw new ForbiddenException('x-role must be ADMIN');
    }

    return true;
  }
}