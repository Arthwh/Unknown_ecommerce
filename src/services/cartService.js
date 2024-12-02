import CartRepository from '../repositories/cartRepository.js';
import { calculatePageParams, createDataStructureForListProducts } from '../helpers/pageHelpers.js';

import pool from '../db.js';
import ProductVariantRepository from '../repositories/productVariantRepository.js';

class CartService {
    static async getCartPageData(user) {
        try {
            const cartItems = await CartRepository.getCartItems(user.id);
            const { cartItems: cartProducts, total_amount: cart_total_amount, total_installments: cart_installments } = await calculateCartParams(cartItems);
            let total_products = 0;
            cartItems.forEach(item => {
                total_products += item.quantity;
            });
            // console.log("CArtITems: ", cartItems)
            const data = {
                user: user,
                cart: {
                    items: cartProducts,
                    total_amount: cart_total_amount,
                    installments: cart_installments,
                    total_products: total_products
                },
                page: {
                    categories: [],
                    displayRegisterModal: true
                }
            }
            // console.log("Data: ", data)
            return data;
        } catch (error) {
            console.error(error);

        }
    }

    static async getCart(userId) {
        return await CartRepository.getCartItems(userId);
    }

    static async getUserCartCount(user) {
        try {
            const cartCount = await CartRepository.getUserCartCount(user.id) || 0;
            return cartCount;
        } catch (error) {
            console.log('Error getting userCartCount: ', error);
            throw error;
        }
    }

    static async addToCart(user, productSku, quantity) {
        try {
            if (!productSku) {
                throw new Error('Product SKU is required');
            };
            let productQuantity = quantity ?? 1
            let userShoppingCartId = await CartRepository.getUserShoppingCartId(user.id);
            if (!userShoppingCartId) {
                userShoppingCartId = await CartRepository.createUserShoppingCart(user.id);
            }
            const variantId = await ProductVariantRepository.getVariantIdByPublicId(productSku);
            if (!variantId) {
                throw new Error('Product variant not found');
            }
            const actualVariantQuantity = await CartRepository.getVariantQuantityFromUserCart(userShoppingCartId, productSku);
            if (!actualVariantQuantity) {
                await CartRepository.addCartItem(userShoppingCartId, variantId, productQuantity);
            }
            else {
                let newQuantity = parseInt(actualVariantQuantity.quantity) + parseInt(productQuantity);
                await CartRepository.updateCartItem(userShoppingCartId, variantId, newQuantity);
            }
        } catch (error) {
            console.error('Error adding product to cart: ', error);
            throw error;
        }
    }

    static async removeFromCart(user, productSku, quantity) {
        try {
            if (!productSku) {
                throw new Error('Product SKU is required');
            };
            let productQuantity = quantity ?? 1
            let userShoppingCartId = await CartRepository.getUserShoppingCartId(user.id);
            if (!userShoppingCartId) {
                throw Error('User shopping cart not found.')
            }
            const variantId = await ProductVariantRepository.getVariantIdByPublicId(productSku);
            if (!variantId) {
                throw new Error('Product variant not found');
            }
            const actualVariantQuantity = await CartRepository.getVariantQuantityFromUserCart(userShoppingCartId, productSku);
            if (actualVariantQuantity.quantity > productQuantity) {
                let newQuantity = parseInt(actualVariantQuantity.quantity) - parseInt(productQuantity);
                await CartRepository.updateCartItem(userShoppingCartId, variantId, newQuantity);
            }
            else {
                await CartRepository.removeCartItem(userShoppingCartId, variantId);
            }
        } catch (error) {
            console.error('Error removing product from cart: ', error);
            throw error;
        }
    }
}

async function calculateCartParams(cartItems) {
    let total_amount = 0;
    let total_installments = 0;
    let total_products = 0;

    cartItems.forEach(item => {
        total_products++;

        if (item.is_on_sale) {
            const offerType = item.variant_offer_type;
            const offerValue = item.variant_offer_value;
            const offerInstallments = item.variant_offer_installments;

            if (offerInstallments && !isNaN(offerInstallments)) {
                total_installments += offerInstallments;
            }

            let discountValue = 0;
            if (offerType === 'percentage') {
                discountValue = (parseFloat(item.unit_price) * parseFloat(offerValue)) / 100;
            } else if (offerType === 'fixed') {
                discountValue = parseFloat(offerValue);
            }
            item.offer_total_price = (parseFloat(item.unit_price) - discountValue) * parseInt(item.quantity);
            total_amount += parseFloat(item.offer_total_price);
        } else {
            total_amount += parseFloat(item.total_price);
            if (item.installments && !isNaN(item.installments)) {
                total_installments += item.installments;
            }
        }
    });

    total_installments = await calculateInstallments(total_installments, total_products, total_amount);

    return {
        total_amount: total_amount.toFixed(2),
        total_installments,
        cartItems
    };
}

async function calculateInstallments(total_installments, total_products, total_amount) {
    const maxInstallments = 10;
    const minInstallmentValue = 40;

    let averageInstallments = Math.ceil(parseInt(total_installments) / parseInt(total_products));

    if (averageInstallments > maxInstallments) {
        averageInstallments = maxInstallments;
    }
    const calculatedInstallmentValue = parseInt(total_amount) / averageInstallments;

    if (averageInstallments < maxInstallments && calculatedInstallmentValue > minInstallmentValue) {
        let ok = true;
        while (ok) {
            if (parseInt(total_amount) / (averageInstallments + 1) > minInstallmentValue && averageInstallments + 1 <= maxInstallments) {
                averageInstallments++;
            }
            else {
                ok = false;
            }
        }
    }

    return averageInstallments;
}

export default CartService;
