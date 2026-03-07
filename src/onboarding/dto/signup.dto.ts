import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Matches, IsOptional, IsIn } from 'class-validator';

export class SignupDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    companyName: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    adminName: string;

    @IsEmail()
    @IsNotEmpty()
    adminEmail: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(128)
    password: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(63)
    @Matches(/^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/, {
        message: 'Subdomain must be lowercase alphanumeric with optional hyphens, 3-63 characters',
    })
    subdomain: string;

    @IsOptional()
    @IsIn(['EN', 'AR'])
    preferredLanguage?: string = 'EN';
}
