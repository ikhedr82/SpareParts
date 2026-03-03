import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get(':businessClientId')
    getCart(@Param('businessClientId') businessClientId: string) {
        return this.cartService.getOrCreateCart(businessClientId);
    }

    @Post(':businessClientId/items')
    addItem(
        @Param('businessClientId') businessClientId: string,
        @Body() addToCartDto: AddToCartDto,
    ) {
        return this.cartService.addItem(businessClientId, addToCartDto);
    }

    @Patch(':businessClientId/items/:productId')
    updateItem(
        @Param('businessClientId') businessClientId: string,
        @Param('productId') productId: string,
        @Body() updateCartItemDto: UpdateCartItemDto,
    ) {
        return this.cartService.updateItem(businessClientId, productId, updateCartItemDto);
    }

    @Delete(':businessClientId/items/:productId')
    removeItem(
        @Param('businessClientId') businessClientId: string,
        @Param('productId') productId: string,
    ) {
        return this.cartService.removeItem(businessClientId, productId);
    }

    @Delete(':businessClientId')
    clearCart(@Param('businessClientId') businessClientId: string) {
        return this.cartService.clearCart(businessClientId);
    }
}
