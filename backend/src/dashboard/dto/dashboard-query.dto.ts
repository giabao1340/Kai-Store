import { IsEnum, IsOptional } from 'class-validator';

export enum DashboardRange {
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  THREE_MONTHS = '3m',
  SIX_MONTHS = '6m',
  ONE_YEAR = '1y',
}

export class DashboardQueryDto {
  @IsOptional()
  @IsEnum(DashboardRange)
  range?: DashboardRange = DashboardRange.THIRTY_DAYS;
}
