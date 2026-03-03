import { FulfillmentMode } from '@prisma/client';
export declare class CreateFulfillmentProviderDto {
    name: string;
    mode: FulfillmentMode;
    phone?: string;
    apiEndpoint?: string;
}
export declare class AssignProviderDto {
    providerId: string;
}
export declare class ManualDeliveryDto {
    success: boolean;
    notes?: string;
}
