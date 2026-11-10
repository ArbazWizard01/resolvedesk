import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.payload';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('tickets/:ticketId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.comments.create(user, ticketId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
  ) {
    return this.comments.findAll(user, ticketId);
  }
}
