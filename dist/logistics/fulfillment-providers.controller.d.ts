import { FulfillmentProvidersService } from './fulfillment-providers.service';
import { CreateFulfillmentProviderDto } from './dto/fulfillment.dto';
export declare class FulfillmentProvidersController {
    private readonly fulfillmentProvidersService;
    constructor(fulfillmentProvidersService: FulfillmentProvidersService);
    create(req: any, dto: CreateFulfillmentProviderDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        phone: string | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        apiEndpoint: string | null;
    }>;
    findAll(req: any, mode?: string, isActive?: string): Promise<({
        _count: {
            trips: number;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        phone: string | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        apiEndpoint: string | null;
    })[]>;
    activate(req: any, providerId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        phone: string | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        apiEndpoint: string | null;
    }>;
    deactivate(req: any, providerId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        tenantId: string;
        phone: string | null;
        mode: import(".prisma/client").$Enums.FulfillmentMode;
        apiEndpoint: string | null;
    }>;
}
