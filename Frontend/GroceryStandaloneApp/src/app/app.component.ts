import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  isBrowser: boolean;
  private platformId = inject(PLATFORM_ID);
  private cartSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  constructor(
    public authService: AuthService,
    private router: Router,
    private cartService: CartService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Subscribe to cart changes
      this.cartSubscription = this.cartService.getCartItems().subscribe(() => {
        this.cartItemCount = this.cartService.getItemCount();
      });

      // Subscribe to router events to handle navigation
      this.routerSubscription = this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        // Check if user is logged in on each navigation
        if (!this.authService.isLoggedIn() &&
            !this.router.url.includes('/login') &&
            !this.router.url.includes('/register') &&
            !this.router.url.includes('/home')) {
          console.log('User not logged in, redirecting to login page');
          this.router.navigate(['/login']);
        }
      });

      // Listen for storage events (login/logout)
      window.addEventListener('storage', this.handleStorageEvent);
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.isBrowser) {
      window.removeEventListener('storage', this.handleStorageEvent);
    }
  }

  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key === 'token') {
      console.log('Token changed in storage, updating UI');
      // Force change detection
      setTimeout(() => {
        if (!this.authService.isLoggedIn() &&
            !this.router.url.includes('/login') &&
            !this.router.url.includes('/register') &&
            !this.router.url.includes('/home')) {
          console.log('User logged out, redirecting to login page');
          this.router.navigate(['/login']);
        }
      }, 0);
    }
  };

  logout() {
    if (this.isBrowser) {
      console.log('Logout clicked');
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
