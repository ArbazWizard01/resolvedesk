import { Body, Controller, Get, Patch, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsString, Length } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.payload';
import { InsightsService } from './insights.service';
class AnalyticsQuery {
  @Type(() => Number)
  @IsIn([7, 30, 90])
  days = 30;
}
class ProfileDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(1, 80)
  name!: string;
}
@Controller()
@UseGuards(JwtAuthGuard)
export class InsightsController {
  constructor(private readonly insights: InsightsService) {}
  @Get('account/profile')
  profile(@CurrentUser() user: JwtPayload) { return this.insights.profile(user); }
  @Patch('account/profile')
  update(@CurrentUser() user: JwtPayload, @Body(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) dto: ProfileDto) {
    return this.insights.updateProfile(user, dto.name);
  }
  @Get('analytics')
  analytics(@CurrentUser() user: JwtPayload, @Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true })) query: AnalyticsQuery) {
    return this.insights.analytics(user, query.days);
  }
}
