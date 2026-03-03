import { IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
    @IsString()
    businessClientId: string;

    @IsString()
    @IsOptional()
    deliveryAddressId?: string;

    @IsString()
    @IsOptional()
    contactId?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
