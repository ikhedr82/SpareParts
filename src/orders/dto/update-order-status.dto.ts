import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus)
    status: OrderStatus;

    /**
     * HC-3: Optimistic concurrency — client must provide the version it last read.
     * If the entity has been updated since, a 409 Conflict is returned.
     */
    @IsOptional()
    @IsInt()
    @Min(0)
    expectedVersion?: number;
}
