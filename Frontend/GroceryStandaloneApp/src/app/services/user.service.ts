import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private isBrowser: boolean;
  private readonly USERS_KEY = 'grocery_users';
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  // Register a new user
  register(user: User): Observable<User> {
    if (this.isBrowser) {
      // Check if email already exists
      const users = this.getUsers();
      if (users.some(u => u.email === user.email)) {
        throw new Error('Email already exists');
      }
      
      // Add user to local storage
      const newUser = {
        ...user,
        id: this.generateUserId()
      };
      
      users.push(newUser);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      
      // Return the new user (without password)
      const { password, ...userWithoutPassword } = newUser;
      return of(userWithoutPassword as User);
    }
    
    return of({} as User);
  }
  
  // Get user by email
  getUserByEmail(email: string): User | undefined {
    if (this.isBrowser) {
      const users = this.getUsers();
      return users.find(u => u.email === email);
    }
    return undefined;
  }
  
  // Update user profile
  updateUser(user: User): Observable<User> {
    if (this.isBrowser) {
      const users = this.getUsers();
      const index = users.findIndex(u => u.id === user.id);
      
      if (index !== -1) {
        users[index] = { ...users[index], ...user };
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        
        // Return updated user (without password)
        const { password, ...userWithoutPassword } = users[index];
        return of(userWithoutPassword as User);
      }
    }
    
    return of({} as User);
  }
  
  // Private helper methods
  private getUsers(): User[] {
    if (this.isBrowser) {
      const usersJson = localStorage.getItem(this.USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    }
    return [];
  }
  
  private generateUserId(): number {
    const users = this.getUsers();
    return users.length > 0 
      ? Math.max(...users.map(u => u.id || 0)) + 1 
      : 1;
  }
}
