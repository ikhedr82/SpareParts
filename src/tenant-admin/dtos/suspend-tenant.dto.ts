import { IsString, IsNotEmpty } from 'class-validator';

export class SuspendTenantDto {
    @IsString()
    @IsNotEmpty()
    reason: string;
}
