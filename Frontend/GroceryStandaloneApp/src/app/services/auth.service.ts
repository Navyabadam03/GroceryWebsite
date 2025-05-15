import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, catchError, tap } from 'rxjs';
import { UserService } from './user.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isBrowser: boolean;

  private apiUrl = `${environment.apiUrl}/api/login`;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    if (this.isBrowser) {
      console.log('Auth service login called with:', credentials);
      console.log('Using API URL:', this.apiUrl);

      return this.http.post<any>(this.apiUrl, credentials).pipe(
        tap(response => {
          console.log('Login response received:', response);
          if (response && response.token) {
            // First check if we had a token before
            const hadToken = this.getToken() !== null;

            // Store the new token
            localStorage.setItem('token', response.token);

            // Store user info if available
            if (response.user) {
              localStorage.setItem('currentUser', JSON.stringify(response.user));
            }

            console.log('User logged in successfully');

            // Dispatch a storage event to notify other components
            if (!hadToken) {
              // Manually dispatch a storage event to notify other components
              window.dispatchEvent(new StorageEvent('storage', {
                key: 'token',
                newValue: response.token,
                oldValue: null,
                storageArea: localStorage
              }));
            }
          }
        }),
        catchError(error => {
          console.error('Login error in auth service:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error details:', error.error);
          return throwError(() => new Error('Invalid email or password'));
        })
      );
    }

    // For SSR, just return a mock response
    return of({ token: 'mock-token' });
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }

  getCurrentUser(): any {
    if (this.isBrowser) {
      const userJson = localStorage.getItem('currentUser');
      return userJson ? JSON.parse(userJson) : null;
    }
    return null;
  }



  isLoggedIn(): boolean {
    if (this.isBrowser) {
      return localStorage.getItem('token') !== null;
    }
    return false;
  }

  logout(): void {
    if (this.isBrowser) {
      // First store the current values to check if they changed
      const hadToken = this.getToken() !== null;

      // Remove the items
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');

      console.log('User logged out');

      // Dispatch a storage event to notify other components
      if (hadToken) {
        // Manually dispatch a storage event to notify other components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'token',
          newValue: null,
          oldValue: 'token-removed',
          storageArea: localStorage
        }));
      }
    }
  }


}
