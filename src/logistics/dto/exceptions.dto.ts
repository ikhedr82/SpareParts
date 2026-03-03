import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryExceptionType, ReturnReason, ReturnStatus, RefundStatus } from '@prisma/client';

// Exceptions DTOs
export class CreateDeliveryExceptionDto {
    @IsString()
    tripStopId: string;

    @IsEnum(DeliveryExceptionType)
    exceptionType: DeliveryExceptionType;

    @IsString()
    description: string;
}

export class ResolveExceptionDto {
    @IsString()
    resolutionType: string;

    @IsOptional()
    @IsString()
    resolutionNotes?: string;
}

// Returns DTOs
export class ReturnItemDto {
    @IsString()
    orderItemId: string;

    @IsNumber()
    @Min(1)
    quantity: number;
}

export class InitiateReturnDto {
    @IsString()
    orderId: string;

    @IsEnum(ReturnReason)
    reason: ReturnReason;

    @IsOptional()
    @IsString()
    reasonNotes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReturnItemDto)
    items: ReturnItemDto[];

    @IsOptional()
    @IsString()
    deliveryExceptionId?: string;
}

export class ReceiveItemDto {
    @IsString()
    returnItemId: string;

    @IsString()
    condition: string;

    @IsBoolean()
    restockable: boolean;

    @IsOptional()
    @IsString()
    inspectionNotes?: string;
}

export class ReceiveReturnDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReceiveItemDto)
    items: ReceiveItemDto[];
}

export class RejectReturnDto {
    @IsString()
    reason: string;
}

// Refunds DTOs
export class CreateRefundDto {
    @IsString()
    orderId: string;

    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsString()
    reason: string;

    @IsOptional()
    @IsString()
    returnId?: string;
}

export class CancelRefundDto {
    @IsString()
    reason: string;
}
