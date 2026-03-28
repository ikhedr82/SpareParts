import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { OpportunityStage } from '@prisma/client';

export class CreateOpportunityDto {
  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @IsString()
  businessClientId?: string;

  @IsString()
  name: string;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage;

  @IsOptional()
  @IsNumber()
  probability?: number;

  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;
}
