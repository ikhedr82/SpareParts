import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class UpdateTenantAdminDto {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsEmail() billingEmail?: string;
    @IsOptional() @IsString() status?: string;
}

export class CreatePlatformAdminDto {
    @IsEmail() email: string;
    @IsString() password: string;
    @IsBoolean() isPlatformUser: boolean = true;
    @IsOptional() @IsString() tenantId?: string;
}

export class UserStatusUpdateDto {
    @IsEnum(['ACTIVE', 'SUSPENDED']) status: string;
}

export class BillingOverrideDto {
    @IsOptional() @IsString() nextBillingDate?: string;
    @IsOptional() @IsEnum(['MONTHLY', 'YEARLY']) billingCycle?: 'MONTHLY' | 'YEARLY';
}
