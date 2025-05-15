import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, catchError, tap } from 'rxjs';
import { Product } from '../models/product';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface CartItem {
  product: Product;
  quantity: number;
  id?: number;
  userId?: number;
  productId?: number;
}

interface ApiCartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product: Product;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/api/cart`;
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Load cart from localStorage if not logged in, otherwise from API
    if (this.isBrowser) {
      this.initializeCart();

      // Listen for login/logout events
      window.addEventListener('storage', (event) => {
        if (event.key === 'token') {
          console.log('Auth token changed, reinitializing cart');
          this.initializeCart();
        }
      });
    }
  }

  private initializeCart(): void {
    if (this.isBrowser) {
      if (this.authService.isLoggedIn()) {
        console.log('User is logged in, loading cart from API');
        this.loadCartFromApi();
      } else if (localStorage.getItem('cart')) {
        console.log('User is not logged in, loading cart from localStorage');
        try {
          this.cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
          this.cartSubject.next([...this.cartItems]);
        } catch (error) {
          console.error('Error loading cart:', error);
          this.cartItems = [];
          this.cartSubject.next([]);
        }
      } else {
        console.log('No cart found, initializing empty cart');
        this.cartItems = [];
        this.cartSubject.next([]);
      }
    }
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  addToCart(product: Product, quantity: number = 1): void {
    if (this.isBrowser) {
      if (this.authService.isLoggedIn()) {
        // Add to API
        const cartItem = {
          productId: product.id,
          quantity: quantity
        };

        this.http.post<ApiCartItem>(this.apiUrl, cartItem)
          .pipe(
            catchError(error => {
              console.error('Error adding to cart:', error);
              return of(null);
            })
          )
          .subscribe(() => {
            this.loadCartFromApi();
          });
      } else {
        // Add to local storage
        const existingItem = this.cartItems.find(item => item.product.id === product.id);

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          this.cartItems.push({ product, quantity });
        }

        this.updateLocalCart();
      }
    }
  }

  removeFromCart(productId: number): void {
    if (this.isBrowser) {
      if (this.authService.isLoggedIn()) {
        // Remove from API
        const item = this.cartItems.find(item => item.product.id === productId);
        if (item && item.id) {
          this.http.delete(`${this.apiUrl}/${item.id}`)
            .pipe(
              catchError(error => {
                console.error('Error removing from cart:', error);
                return of(null);
              })
            )
            .subscribe(() => {
              this.loadCartFromApi();
            });
        }
      } else {
        // Remove from local storage
        this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
        this.updateLocalCart();
      }
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    if (this.isBrowser) {
      if (this.authService.isLoggedIn()) {
        // Update in API
        const item = this.cartItems.find(item => item.product.id === productId);
        if (item && item.id) {
          const updatedItem = {
            id: item.id,
            productId: productId,
            quantity: quantity <= 0 ? 1 : quantity,
            userId: item.userId
          };

          this.http.put(`${this.apiUrl}/${item.id}`, updatedItem)
            .pipe(
              catchError(error => {
                console.error('Error updating cart:', error);
                return of(null);
              })
            )
            .subscribe(() => {
              this.loadCartFromApi();
            });
        }
      } else {
        // Update in local storage
        const item = this.cartItems.find(item => item.product.id === productId);
        if (item) {
          item.quantity = quantity <= 0 ? 1 : quantity;
          this.updateLocalCart();
        }
      }
    }
  }

  clearCart(): void {
    if (this.isBrowser) {
      if (this.authService.isLoggedIn()) {
        // Clear in API
        this.http.delete(this.apiUrl)
          .pipe(
            catchError(error => {
              console.error('Error clearing cart:', error);
              return of(null);
            })
          )
          .subscribe(() => {
            this.cartItems = [];
            this.cartSubject.next([]);
          });
      } else {
        // Clear in local storage
        this.cartItems = [];
        this.updateLocalCart();
      }
    }
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) =>
      total + (item.product.price * item.quantity), 0);
  }

  getItemCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  private updateLocalCart(): void {
    this.cartSubject.next([...this.cartItems]);

    if (this.isBrowser) {
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }
  }

  private loadCartFromApi(): void {
    if (this.isBrowser && this.authService.isLoggedIn()) {
      this.http.get<ApiCartItem[]>(this.apiUrl)
        .pipe(
          catchError(error => {
            console.error('Error loading cart from API:', error);
            return of([]);
          }),
          tap(items => {
            this.cartItems = items.map(item => ({
              id: item.id,
              userId: item.userId,
              productId: item.productId,
              product: item.product,
              quantity: item.quantity
            }));
            this.cartSubject.next([...this.cartItems]);
          })
        )
        .subscribe();
    }
  }
}
