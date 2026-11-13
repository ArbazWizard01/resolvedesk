import {
  recipients,
  statusRecipients,
} from '../notifications/notification-recipients';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtPayload } from '../auth/jwt.payload';
import {
  Prisma,
  Role,
  TicketPriority,
  TicketStatus,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { QueryTicketsDto } from './dto/query-tickets.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly include = {
    createdBy: { select: { id: true, name: true, email: true } },
    assignedTo: { select: { id: true, name: true, email: true } },
  } satisfies Prisma.TicketInclude;

  // Which tickets can this user see?
  private visibilityFilter(user: JwtPayload): Prisma.TicketWhereInput {
    if (user.role === Role.ADMIN) return {};
    if (user.role === Role.AGENT) {
      return { OR: [{ assignedToId: user.sub }, { assignedToId: null }] };
    }
    return { createdById: user.sub };
  }

  async create(user: JwtPayload, dto: CreateTicketDto) {
    return this.prisma.$transaction(async (tx) => {
      const admins = await tx.user.findMany({
        where: { role: Role.ADMIN },
        select: { id: true },
      });
      return tx.ticket.create({
        data: {
          ...dto,
          createdById: user.sub,
          activities: {
            create: { action: 'Ticket created', actorId: user.sub },
          },
          notifications: {
            create: recipients(
              user.sub,
              admins.map((a) => a.id),
            ).map((recipientId) => ({
              recipientId,
              type: 'TICKET_CREATED' as const,
              title: 'New ticket needs assignment',
              message: `“${dto.title}” was created with ${dto.priority ?? 'MEDIUM'} priority.`,
            })),
          },
        },
        include: this.include,
      });
    });
  }

  async findAll(user: JwtPayload, query: QueryTicketsDto) {
    const where: Prisma.TicketWhereInput = {
      AND: [
        this.visibilityFilter(user),
        { status: query.status, priority: query.priority },
      ],
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        include: this.include,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async findOne(user: JwtPayload, id: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { AND: [{ id }, this.visibilityFilter(user)] },
      include: this.include,
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async updateStatus(user: JwtPayload, id: string, dto: UpdateStatusDto) {
    const ticket = await this.findOne(user, id);

    if (user.role === Role.AGENT && ticket.assignedToId !== user.sub) {
      throw new ForbiddenException(
        'Only the assigned agent can change this ticket',
      );
    }

    if (ticket.status === dto.status) return ticket;
    return this.prisma.$transaction(async (tx) => {
      const admins = ['RESOLVED', 'CLOSED'].includes(dto.status)
        ? await tx.user.findMany({
            where: { role: Role.ADMIN },
            select: { id: true },
          })
        : [];
      return tx.ticket.update({
        where: { id },
        data: {
          notifications: {
            create: statusRecipients({
              actorId: user.sub,
              customerId: ticket.createdById,
              assignedToId: ticket.assignedToId,
              status: dto.status,
              adminIds: admins.map((a) => a.id),
            }).map((recipientId) => ({
              recipientId,
              type: 'STATUS_CHANGED' as const,
              title: 'Ticket status updated',
              message: `“${ticket.title}” changed from ${ticket.status.replaceAll('_', ' ')} to ${dto.status.replaceAll('_', ' ')}.`,
            })),
          },
          status: dto.status,
          activities: {
            create: {
              action: `Status changed from ${ticket.status} to ${dto.status}`,
              actorId: user.sub,
            },
          },
        },
        include: this.include,
      });
    });
  }

  async assign(user: JwtPayload, id: string, dto: AssignTicketDto) {
    const ticket = await this.findOne(user, id);

    const agent = await this.prisma.user.findUnique({
      where: { id: dto.assignedToId },
    });
    if (!agent || agent.role !== Role.AGENT) {
      throw new BadRequestException('Assignee must be an existing agent');
    }

    if (ticket.assignedToId === agent.id) return ticket;
    return this.prisma.ticket.update({
      where: { id },
      data: {
        notifications: {
          create: recipients(user.sub, [ticket.createdById, agent.id]).map(
            (recipientId) => ({
              recipientId,
              type: 'AGENT_ASSIGNED' as const,
              title:
                recipientId === agent.id
                  ? 'A ticket was assigned to you'
                  : ticket.assignedToId
                    ? 'Your ticket was reassigned'
                    : 'Agent assigned',
              message:
                recipientId === agent.id
                  ? `You are now responsible for “${ticket.title}”.`
                  : `${agent.name} will handle “${ticket.title}”.`,
            }),
          ),
        },
        assignedToId: agent.id,
        activities: {
          create: { action: `Assigned to ${agent.name}`, actorId: user.sub },
        },
      },
      include: this.include,
    });
  }

  async getActivity(user: JwtPayload, id: string) {
    await this.findOne(user, id); // makes sure this user may see the ticket
    return this.prisma.activity.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'asc' },
      include: { actor: { select: { id: true, name: true, role: true } } },
    });
  }

  async getStats(user: JwtPayload) {
    const where = this.visibilityFilter(user);

    const [total, unassigned, byStatus, byPriority] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.count({
        where: { AND: [where, { assignedToId: null }] },
      }),
      this.prisma.ticket.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      this.prisma.ticket.groupBy({
        by: ['priority'],
        where,
        _count: { _all: true },
      }),
    ]);

    // Start every status/priority at 0 so the frontend always gets all keys
    const status = Object.fromEntries(
      Object.values(TicketStatus).map((s) => [s, 0]),
    ) as Record<TicketStatus, number>;
    const priority = Object.fromEntries(
      Object.values(TicketPriority).map((p) => [p, 0]),
    ) as Record<TicketPriority, number>;

    byStatus.forEach((row) => (status[row.status] = row._count._all));
    byPriority.forEach((row) => (priority[row.priority] = row._count._all));

    return { total, unassigned, byStatus: status, byPriority: priority };
  }
}
