import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/jwt.payload';
import { Role } from '../generated/prisma/client';
import { summarize } from './analytics-summary';

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly publicUser = { id: true, name: true, email: true, role: true } as const;

  async profile(user: JwtPayload) {
    const profile = await this.prisma.user.findUnique({ where: { id: user.sub }, select: this.publicUser });
    if (!profile) throw new NotFoundException('User not found');
    return profile;
  }
  async updateProfile(user: JwtPayload, name: string) {
    const trimmed = name.trim();
    if (!trimmed) throw new BadRequestException('Name cannot be empty');
    return this.prisma.user.update({ where: { id: user.sub }, data: { name: trimmed }, select: this.publicUser });
  }
  async analytics(user: JwtPayload, days: number) {
    if (user.role !== Role.ADMIN && user.role !== Role.AGENT) throw new ForbiddenException('Analytics is available to staff only');
    const until = new Date();
    const since = new Date(until);
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - days + 1);
    const tickets = await this.prisma.ticket.findMany({
      where: {
        createdAt: { gte: since, lte: until },
        ...(user.role === Role.AGENT ? { assignedToId: user.sub } : {}),
      },
      select: {
        status: true, priority: true, createdAt: true, createdById: true,
        assignedTo: { select: { id: true, name: true } },
        comments: {
          where: { author: { role: { in: [Role.ADMIN, Role.AGENT] } } },
          orderBy: { createdAt: 'asc' }, select: { createdAt: true, authorId: true },
        },
      },
    });
    return { ...summarize(tickets, since, until, user.role === Role.ADMIN),
      scope: user.role === Role.ADMIN ? 'TEAM' : 'ASSIGNED', days,
      since: since.toISOString(), asOf: until.toISOString(), timezone: 'UTC' };
  }
}
