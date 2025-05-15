import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Mock product data
  private products: Product[] = [
    {
      id: 1,
      name: 'Fresh Apples',
      description: 'Crisp and juicy apples freshly picked from the orchard.',
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&h=200',
      price: 2.99
    },
    {
      id: 2,
      name: 'Organic Bananas',
      description: 'Sweet and nutritious organic bananas grown without pesticides.',
      imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=300&h=200',
      price: 1.99
    },
    {
      id: 3,
      name: 'Whole Wheat Bread',
      description: 'Freshly baked whole wheat bread made with premium ingredients.',
      imageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=300&h=200',
      price: 3.49
    },
    {
      id: 4,
      name: 'Organic Milk',
      description: 'Fresh organic milk from grass-fed cows.',
      imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&h=200',
      price: 4.29
    },
    {
      id: 5,
      name: 'Farm Fresh Eggs',
      description: 'Free-range eggs from locally raised hens.',
      imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=300&h=200',
      price: 5.99
    },
    {
      id: 6,
      name: 'Organic Avocados',
      description: 'Perfectly ripe organic avocados, ready to eat.',
      imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=300&h=200',
      price: 2.49
    }
  ];

  constructor() {}

  getProducts(): Observable<Product[]> {
    console.log('Getting products');
    return of(this.products);
  }

  getProductById(id: number): Observable<Product | undefined> {
    console.log(`Getting product with id ${id}`);
    return of(this.products.find(p => p.id === id));
  }

  getFeaturedProducts(): Observable<Product[]> {
    console.log('Getting featured products');
    return of(this.products.slice(0, 3));
  }
}
