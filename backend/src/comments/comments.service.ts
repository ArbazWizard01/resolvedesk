import { commentRecipients } from '../notifications/notification-recipients';
import { Role } from '../generated/prisma/client';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../auth/jwt.payload';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tickets: TicketsService,
  ) {}

  private readonly author = {
    select: { id: true, name: true, role: true },
  } as const;

  async create(user: JwtPayload, ticketId: string, dto: CreateCommentDto) {
    const ticket = await this.tickets.findOne(user, ticketId);
    const comment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: { content: dto.content, ticketId, authorId: user.sub },
        include: { author: this.author },
      });
      await tx.activity.create({
        data: { ticketId, actorId: user.sub, action: 'Comment added' },
      });
      const admins =
        user.role === Role.CUSTOMER && !ticket.assignedToId
          ? await tx.user.findMany({
              where: { role: Role.ADMIN },
              select: { id: true },
            })
          : [];
      const recipientIds = commentRecipients({
        actorId: user.sub,
        actorRole: user.role,
        customerId: ticket.createdById,
        assignedToId: ticket.assignedToId,
        adminIds: admins.map((a) => a.id),
      });
      if (recipientIds.length) {
        await tx.notification.createMany({
          data: recipientIds.map((recipientId) => ({
            ticketId,
            recipientId,
            type: 'COMMENT_ADDED' as const,
            title:
              recipientId === ticket.createdById
                ? 'New reply on your ticket'
                : user.role === Role.CUSTOMER
                  ? 'Customer replied to a ticket'
                  : 'New reply on an assigned ticket',
            message: `${created.author.name} replied to “${ticket.title}”: ${dto.content.slice(0, 180)}`,
          })),
        });
      }
      return created;
    });
    return comment;
  }

  async findAll(user: JwtPayload, ticketId: string) {
    await this.tickets.findOne(user, ticketId);
    return this.prisma.comment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: { author: this.author },
    });
  }
}
