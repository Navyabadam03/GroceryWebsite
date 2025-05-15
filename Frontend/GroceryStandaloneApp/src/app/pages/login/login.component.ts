import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };
  errorMessage: string = '';
  isBrowser: boolean;

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  onSubmit() {
    // Clear any previous error messages
    this.errorMessage = '';

    // Simple validation
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    console.log('Attempting login with:', this.loginData);
    console.log('API URL:', this.authService['apiUrl']);

    // Show loading state
    this.errorMessage = 'Logging in...';

    // Use auth service to login
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Login successful, response:', response);
        this.errorMessage = '';

        // Small delay to ensure token is stored before navigation
        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 100);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'Invalid email or password. Please try again.';
      }
    });
  }

  forgotPassword() {
    if (!this.loginData.email) {
      this.errorMessage = 'Please enter your email address first';
      return;
    }

    if (this.isBrowser) {
      // Simple alert for demo purposes
      alert(`Password reset link would be sent to ${this.loginData.email}`);
      this.errorMessage = '';
    }
  }

  fillDemoCredentials() {
    this.loginData.email = 'testuser@example.com';
    this.loginData.password = 'Test@1234';
    this.errorMessage = '';
  }

  testDirectLogin() {
    // Fill in the demo credentials
    this.fillDemoCredentials();

    // Make a direct fetch request to the API
    if (this.isBrowser) {
      const apiUrl = 'http://localhost:5200/api/login';
      console.log('Testing direct login to:', apiUrl);

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.loginData.email,
          password: this.loginData.password
        })
      })
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error('Login failed: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        console.log('Direct login successful:', data);
        this.errorMessage = 'Direct login successful! Token: ' + data.token.substring(0, 20) + '...';

        // Store the token and navigate
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
        this.router.navigate(['/products']);
      })
      .catch(error => {
        console.error('Direct login error:', error);
        this.errorMessage = 'Direct login error: ' + error.message;
      });
    }
  }
}

