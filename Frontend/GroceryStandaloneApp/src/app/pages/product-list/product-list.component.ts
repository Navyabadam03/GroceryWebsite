import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
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
    // Simple product loading
    this.productService.getProducts().subscribe(products => {
      console.log('Products received:', products);
      this.products = products;
      this.loading = false;
    });
  }

  addToCart(product: Product): void {
    if (this.isBrowser) {
      this.cartService.addToCart(product);
      alert(`${product.name} added to cart!`);
    }
  }
}
