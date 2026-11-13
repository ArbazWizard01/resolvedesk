import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(recipientId: string) {
    const [items, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { recipientId },
        take: 50,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.notification.count({ where: { recipientId, readAt: null } }),
    ]);
    return { items, unreadCount };
  }

  async read(recipientId: string, id: string) {
    // Scope every mutation to the authenticated recipient; never trust a client user ID.
    const item = await this.prisma.notification.findFirst({
      where: { id, recipientId },
    });
    if (!item) throw new NotFoundException('Notification not found');
    await this.prisma.notification.updateMany({
      where: { id, recipientId, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  async readAll(recipientId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { recipientId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: result.count };
  }
}
