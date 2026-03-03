import { DeliveryExceptionType, ReturnReason } from '@prisma/client';
export declare class CreateDeliveryExceptionDto {
    tripStopId: string;
    exceptionType: DeliveryExceptionType;
    description: string;
}
export declare class ResolveExceptionDto {
    resolutionType: string;
    resolutionNotes?: string;
}
export declare class ReturnItemDto {
    orderItemId: string;
    quantity: number;
}
export declare class InitiateReturnDto {
    orderId: string;
    reason: ReturnReason;
    reasonNotes?: string;
    items: ReturnItemDto[];
    deliveryExceptionId?: string;
}
export declare class ReceiveItemDto {
    returnItemId: string;
    condition: string;
    restockable: boolean;
    inspectionNotes?: string;
}
export declare class ReceiveReturnDto {
    items: ReceiveItemDto[];
}
export declare class RejectReturnDto {
    reason: string;
}
export declare class CreateRefundDto {
    orderId: string;
    amount: number;
    reason: string;
    returnId?: string;
}
export declare class CancelRefundDto {
    reason: string;
}
