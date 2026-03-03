import { PartialType } from '@nestjs/mapped-types';
import { CreateBusinessClientDto } from './create-business-client.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateBusinessClientDto extends PartialType(CreateBusinessClientDto) {
    @IsOptional()
    @IsEnum(['ACTIVE', 'SUSPENDED', 'INACTIVE'])
    status?: string;
}
