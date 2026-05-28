import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildCursorPage } from '../../common/dto/cursor-pagination.dto';

export interface LogAuditParams {
  actorId:    string;
  action:     string;
  targetType: string;
  targetId:   string;
  metadata?:  Record<string, unknown>;
  ip?:        string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Record an audit event ─────────────────────────────────────────────────
  async log(params: LogAuditParams): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId:    params.actorId,
          action:     params.action,
          targetType: params.targetType,
          targetId:   params.targetId,
          metadata:   params.metadata as any,
          ip:         params.ip,
        },
      });
    } catch {
      // Non-critical — audit logging must not break the main flow
    }
  }

  // ── Query audit logs with filters (admin only) ────────────────────────────
  async getLogs(opts: {
    actorId?:    string;
    targetType?: string;
    action?:     string;
    limit?:      number;
    cursor?:     string;
  }) {
    const { actorId, targetType, action, limit = 50, cursor } = opts;
    const take = limit + 1;

    const where: any = {};
    if (actorId)    where.actorId    = actorId;
    if (targetType) where.targetType = targetType;
    if (action)     where.action     = action;

    const items = await this.prisma.auditLog.findMany({
      where,
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: { id: true, email: true, role: true },
        },
      },
    });

    const { items: page, nextCursor } = buildCursorPage(items, limit);
    return { items: page, nextCursor };
  }
}
