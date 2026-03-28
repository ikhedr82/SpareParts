import { IsString } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  opportunityId?: string;

  @IsString()
  @IsOptional()
  dealId?: string;

  @IsString()
  @IsOptional()
  businessClientId?: string;
}
