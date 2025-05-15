import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];
  allProducts: Product[] = [];
  loading = true;
  isBrowser: boolean;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Get featured products
    this.productService.getFeaturedProducts().subscribe({
      next: (data) => {
        this.featuredProducts = data;
      },
      error: (err) => {
        console.error('Failed to load featured products', err);
      }
    });

    // Get all products
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allProducts = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.loading = false;
      }
    });
  }

  addToCart(product: Product): void {
    if (this.isBrowser) {
      this.cartService.addToCart(product);
      alert(`${product.name} added to cart!`);
    }
  }
}
