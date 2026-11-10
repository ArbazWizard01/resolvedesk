import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.payload';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../generated/prisma/client';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { QueryTicketsDto } from './dto/query-tickets.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTicketDto) {
    return this.tickets.create(user, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: QueryTicketsDto) {
    return this.tickets.findAll(user, query);
  }

  @Get('stats')
  getStats(@CurrentUser() user: JwtPayload) {
    return this.tickets.getStats(user);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tickets.findOne(user, id);
  }

  @Roles(Role.ADMIN, Role.AGENT)
  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.tickets.updateStatus(user, id, dto);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/assign')
  assign(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTicketDto,
  ) {
    return this.tickets.assign(user, id, dto);
  }

  @Get(':id/activity')
  getActivity(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tickets.getActivity(user, id);
  }
}
