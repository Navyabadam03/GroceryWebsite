import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  isBrowser: boolean;

  constructor(
    private cartService: CartService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      // Subscribe to cart changes
      this.cartService.getCartItems().subscribe(items => {
        this.cartItems = items;
        this.cartTotal = this.cartService.getCartTotal();
      });
    }
  }

  // Update item quantity
  updateQuantity(productId: number, quantity: number): void {
    if (this.isBrowser) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  // Remove item from cart
  removeItem(productId: number): void {
    if (this.isBrowser) {
      this.cartService.removeFromCart(productId);
    }
  }

  // Clear entire cart
  clearCart(): void {
    if (this.isBrowser) {
      this.cartService.clearCart();
    }
  }

  // Navigate to checkout
  checkout(): void {
    if (this.isBrowser) {
      if (this.cartItems.length === 0) {
        alert('Your cart is empty');
        return;
      }
      this.router.navigate(['/checkout']);
    }
  }
}
