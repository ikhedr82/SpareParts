import { BillingCycle } from '@prisma/client';
export declare class CreatePlanDto {
    name: string;
    price: number;
    currency?: string;
    billingCycle?: BillingCycle;
    isActive?: boolean;
    features?: any;
    limits?: any;
}
export declare class UpdatePlanDto {
    name?: string;
    price?: number;
    currency?: string;
    billingCycle?: BillingCycle;
    isActive?: boolean;
    features?: any;
    limits?: any;
}
