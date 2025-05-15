import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {
  product: Product | undefined;
  loading = true;
  quantity = 1;
  isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Get product ID from route parameters
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    if (productId) {
      this.productService.getProductById(productId).subscribe(product => {
        this.product = product;
        this.loading = false;
      });
    }
  }

  // Quantity controls
  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // Add to cart
  addToCart(): void {
    if (this.isBrowser && this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      alert(`${this.quantity} ${this.product.name} added to cart!`);
    }
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/products']);
  }
}
