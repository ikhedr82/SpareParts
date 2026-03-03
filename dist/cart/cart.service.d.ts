import { TenantAwarePrismaService } from '../prisma/tenant-aware-prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { TranslationService } from '../i18n/translation.service';
export declare class CartService {
    private readonly prisma;
    private readonly t;
    constructor(prisma: TenantAwarePrismaService, t: TranslationService);
    getOrCreateCart(businessClientId: string): Promise<any>;
    addItem(businessClientId: string, dto: AddToCartDto): Promise<any>;
    updateItem(businessClientId: string, productId: string, dto: UpdateCartItemDto): Promise<any>;
    removeItem(businessClientId: string, productId: string): Promise<any>;
    clearCart(businessClientId: string): Promise<any>;
    private calculateCartTotals;
}
