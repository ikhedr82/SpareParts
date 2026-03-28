import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { DealStatus } from '@prisma/client';

export class CreateDealDto {
  @IsString()
  opportunityId: string;

  @IsString()
  name: string;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @IsOptional()
  @IsDateString()
  closedAt?: string;
}
