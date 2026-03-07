import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsEnum, IsOptional, IsJSON } from 'class-validator';
import { BillingCycle } from '@prisma/client';

export class CreatePlanDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    price: number;

    @IsString()
    @IsOptional()
    currency?: string = 'USD';

    @IsEnum(BillingCycle)
    @IsOptional()
    billingCycle?: BillingCycle = BillingCycle.MONTHLY;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean = true;

    @IsOptional()
    features?: any;

    @IsOptional()
    limits?: any;
}

export class UpdatePlanDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsEnum(BillingCycle)
    @IsOptional()
    billingCycle?: BillingCycle;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsOptional()
    features?: any;

    @IsOptional()
    limits?: any;
}
