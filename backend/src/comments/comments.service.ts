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
    await this.tickets.findOne(user, ticketId);

    const [comment] = await this.prisma.$transaction([
      this.prisma.comment.create({
        data: { content: dto.content, ticketId, authorId: user.sub },
        include: { author: this.author },
      }),
      this.prisma.activity.create({
        data: { ticketId, actorId: user.sub, action: 'Comment added' },
      }),
    ]);
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