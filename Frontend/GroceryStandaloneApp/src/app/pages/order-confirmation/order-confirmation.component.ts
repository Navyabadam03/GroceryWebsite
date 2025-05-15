import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css'
})
export class OrderConfirmationComponent implements OnInit {
  orderNumber: string = '';
  estimatedDelivery: string = '';
  address: any = {};
  isBrowser: boolean;
  
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  ngOnInit(): void {
    if (this.isBrowser) {
      // Generate random order number
      this.orderNumber = this.generateOrderNumber();
      
      // Calculate estimated delivery date (3-5 business days from now)
      this.estimatedDelivery = this.calculateEstimatedDelivery();
      
      // Load saved address
      const savedAddress = localStorage.getItem('userAddress');
      if (savedAddress) {
        try {
          this.address = JSON.parse(savedAddress);
        } catch (error) {
          console.error('Error parsing saved address', error);
        }
      } else {
        // Redirect to home if no address is found (shouldn't happen normally)
        this.router.navigate(['/']);
      }
    }
  }
  
  generateOrderNumber(): string {
    // Generate a random alphanumeric order number
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  calculateEstimatedDelivery(): string {
    const today = new Date();
    
    // Add 3-5 business days
    const daysToAdd = Math.floor(Math.random() * 3) + 3; // Random between 3-5
    const deliveryDate = new Date(today);
    
    let businessDaysAdded = 0;
    while (businessDaysAdded < daysToAdd) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        businessDaysAdded++;
      }
    }
    
    // Format date as Month Day, Year
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return deliveryDate.toLocaleDateString('en-US', options);
  }
}
