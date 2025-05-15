import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: User = {
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  };

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  errorMessage: string = '';
  successMessage: string = '';
  editMode: boolean = false;
  changePassword: boolean = false;
  isBrowser: boolean;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.router.navigate(['/login']);
        return;
      }

      const userDetails = this.userService.getUserByEmail(currentUser.email);
      if (userDetails) {
        // Don't expose the password
        const { password, ...userWithoutPassword } = userDetails;
        this.user = { ...userWithoutPassword, password: '' } as User;
      }
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.changePassword = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  toggleChangePassword(): void {
    this.changePassword = !this.changePassword;
    this.errorMessage = '';
    this.successMessage = '';

    // Reset password fields
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  updateProfile(): void {
    if (!this.user.name || !this.user.email) {
      this.errorMessage = 'Name and email are required';
      return;
    }

    // Get the original user to preserve the password
    const originalUser = this.userService.getUserByEmail(this.user.email);
    if (!originalUser) {
      this.errorMessage = 'User not found';
      return;
    }

    // Update user with original password
    const updatedUser = { ...this.user, password: originalUser.password };

    try {
      this.userService.updateUser(updatedUser).subscribe({
        next: () => {
          this.successMessage = 'Profile updated successfully';
          this.editMode = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to update profile';
        }
      });
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to update profile';
    }
  }

  updatePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'All password fields are required';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New passwords do not match';
      return;
    }

    // Get the original user to check the current password
    const originalUser = this.userService.getUserByEmail(this.user.email);
    if (!originalUser) {
      this.errorMessage = 'User not found';
      return;
    }

    if (originalUser.password !== this.currentPassword) {
      this.errorMessage = 'Current password is incorrect';
      return;
    }

    // Update user with new password
    const updatedUser = { ...this.user, password: this.newPassword };

    try {
      this.userService.updateUser(updatedUser).subscribe({
        next: () => {
          this.successMessage = 'Password updated successfully';
          this.changePassword = false;
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to update password';
        }
      });
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to update password';
    }
  }
}
