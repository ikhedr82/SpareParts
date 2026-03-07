import { IsString, IsOptional, IsEmail, IsBoolean, MaxLength } from 'class-validator';

export class CreateBusinessClientContactDto {
    @IsString()
    @MaxLength(200)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    position?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string;

    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean;

    @IsOptional()
    @IsBoolean()
    canPlaceOrders?: boolean;
}
