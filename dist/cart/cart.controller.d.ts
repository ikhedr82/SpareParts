import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(businessClientId: string): Promise<any>;
    addItem(businessClientId: string, addToCartDto: AddToCartDto): Promise<any>;
    updateItem(businessClientId: string, productId: string, updateCartItemDto: UpdateCartItemDto): Promise<any>;
    removeItem(businessClientId: string, productId: string): Promise<any>;
    clearCart(businessClientId: string): Promise<any>;
}
