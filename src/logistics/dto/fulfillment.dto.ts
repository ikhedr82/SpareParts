import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { FulfillmentMode } from '@prisma/client';

export class CreateFulfillmentProviderDto {
    @IsString()
    name: string;

    @IsEnum(FulfillmentMode)
    mode: FulfillmentMode;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    apiEndpoint?: string;
}

export class AssignProviderDto {
    @IsString()
    providerId: string;
}

export class ManualDeliveryDto {
    @IsBoolean()
    success: boolean;

    @IsOptional()
    @IsString()
    notes?: string;
}
