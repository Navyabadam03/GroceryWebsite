import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';

interface PaymentDetails {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  paymentDetails: PaymentDetails = {
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  };
  
  cartTotal: number = 0;
  isBrowser: boolean;
  address: any = {};
  months: string[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  years: string[] = [];
  isProcessing: boolean = false;
  orderComplete: boolean = false;
  
  constructor(
    private cartService: CartService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Generate years for expiry date dropdown (current year + 10 years)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      this.years.push((currentYear + i).toString());
    }
  }
  
  ngOnInit(): void {
    if (this.isBrowser) {
      // Load saved address
      const savedAddress = localStorage.getItem('userAddress');
      if (savedAddress) {
        try {
          this.address = JSON.parse(savedAddress);
        } catch (error) {
          console.error('Error parsing saved address', error);
          // Redirect back to address page if no address is found
          this.router.navigate(['/address']);
        }
      } else {
        // Redirect back to address page if no address is found
        this.router.navigate(['/address']);
      }
      
      // Get cart total
      this.cartService.getCartItems().subscribe(() => {
        this.cartTotal = this.cartService.getCartTotal();
      });
    }
  }
  
  onSubmit(): void {
    if (this.isBrowser) {
      this.isProcessing = true;
      
      // Simulate payment processing
      setTimeout(() => {
        this.isProcessing = false;
        this.orderComplete = true;
        
        // Clear cart after successful order
        this.cartService.clearCart();
        
        // Redirect to order confirmation page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/order-confirmation']);
        }, 2000);
      }, 2000);
    }
  }
  
  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    
    // Add spaces after every 4 digits
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.paymentDetails.cardNumber = formattedValue;
  }
  
  formatCVV(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 3) {
      value = value.substring(0, 3);
    }
    this.paymentDetails.cvv = value;
  }
  
  isFormValid(): boolean {
    return !!(
      this.paymentDetails.cardNumber.replace(/\s/g, '').length === 16 &&
      this.paymentDetails.cardholderName &&
      this.paymentDetails.expiryMonth &&
      this.paymentDetails.expiryYear &&
      this.paymentDetails.cvv.length === 3
    );
  }
}
