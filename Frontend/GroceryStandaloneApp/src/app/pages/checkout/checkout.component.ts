import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';

interface CheckoutForm {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  isBrowser: boolean;
  orderPlaced = false;
  orderNumber = '';
  
  checkoutForm: CheckoutForm = {
    fullName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: ''
  };

  constructor(
    private cartService: CartService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.cartService.getCartItems().subscribe(items => {
        this.cartItems = items;
        this.cartTotal = this.cartService.getCartTotal();
        
        // Redirect to cart if cart is empty
        if (this.cartItems.length === 0) {
          this.router.navigate(['/cart']);
        }
      });
    }
  }

  placeOrder(): void {
    if (this.isBrowser) {
      // Generate random order number
      this.orderNumber = 'ORD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      
      // Show order confirmation
      this.orderPlaced = true;
      
      // Clear cart
      this.cartService.clearCart();
      
      // In a real app, you would send the order to the backend here
    }
  }

  isFormValid(): boolean {
    return !!(
      this.checkoutForm.fullName &&
      this.checkoutForm.email &&
      this.checkoutForm.address &&
      this.checkoutForm.city &&
      this.checkoutForm.zipCode &&
      this.checkoutForm.cardNumber &&
      this.checkoutForm.cardName &&
      this.checkoutForm.cardExpiry &&
      this.checkoutForm.cardCvv
    );
  }
}
