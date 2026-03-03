import { IsString, IsNotEmpty } from 'class-validator';

export class VoidSaleDto {
    @IsString()
    @IsNotEmpty()
    reason: string;
}
