import { BusinessClientType } from '@prisma/client';
export declare class CreateBusinessClientDto {
    type: BusinessClientType;
    businessName: string;
    registrationNumber?: string;
    taxId?: string;
    primaryEmail?: string;
    primaryPhone?: string;
    creditLimit?: number;
    paymentTermsDays?: number;
    notes?: string;
}
