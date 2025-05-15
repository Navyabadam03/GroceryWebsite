import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';

interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.css'
})
export class AddressComponent implements OnInit {
  address: Address = {
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phoneNumber: ''
  };
  
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
      // Load saved address if available
      const savedAddress = localStorage.getItem('userAddress');
      if (savedAddress) {
        try {
          this.address = JSON.parse(savedAddress);
        } catch (error) {
          console.error('Error parsing saved address', error);
        }
      }
      
      // Get cart total
      this.cartService.getCartItems().subscribe(() => {
        this.cartTotal = this.cartService.getCartTotal();
      });
    }
  }
  
  onSubmit(): void {
    if (this.isBrowser) {
      // Save address to localStorage
      localStorage.setItem('userAddress', JSON.stringify(this.address));
      
      // Navigate to payment page
      this.router.navigate(['/payment']);
    }
  }
  
  isFormValid(): boolean {
    return !!(
      this.address.fullName &&
      this.address.addressLine1 &&
      this.address.city &&
      this.address.state &&
      this.address.zipCode &&
      this.address.country &&
      this.address.phoneNumber
    );
  }
}
