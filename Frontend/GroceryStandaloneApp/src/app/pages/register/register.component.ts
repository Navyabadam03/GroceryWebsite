import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  user: User = {
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  };

  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isBrowser: boolean;

  constructor(
    private userService: UserService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  onSubmit(): void {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate form
    if (!this.user.name || !this.user.email || !this.user.password) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    // Check if passwords match
    if (this.user.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // Check if email already exists
    const existingUser = this.userService.getUserByEmail(this.user.email);
    if (existingUser) {
      this.errorMessage = 'Email already exists. Please use a different email address.';
      return;
    }

    // Register user
    try {
      this.userService.register(this.user).subscribe({
        next: () => {
          this.successMessage = 'Registration successful! You can now login.';

          // Redirect to login page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Registration failed. Please try again.';
        }
      });
    } catch (error: any) {
      this.errorMessage = error.message || 'Registration failed. Please try again.';
    }
  }
}
