import { Component } from '@angular/core';
  import { Router } from '@angular/router';
  import { HttpClient } from '@angular/common/http';
 
@Component({
    templateUrl: './select-edition.component.html',
    standalone: false
})
export class SelectEditionComponent {
    constructor(private router: Router, private http: HttpClient) {}
 
  selectPlan(plan: string) {
    localStorage.setItem('selectedPlan', plan);
 
    if (plan === 'trial') {
      this.router.navigate(['/account/register']);
    } else {
      const priceId = this.getStripePriceId(plan);
      const body = { priceId };
 
      this.http.post('https://localhost:44311/api/stripe/create-session', body, {
        responseType: 'text'
      }).subscribe({
        next: (url: string) => {
  console.log('Redirecting to:', url);
  window.location.href = url; // ✅ correct
},
        error: (err) => {
          console.error('Stripe session creation failed', err);
          alert('Failed to start Stripe session. Check backend server and CORS config.');
        }
      });
    }
  }
 
 
    private getStripePriceId(plan: string): string {
      const priceMap: { [key: string]: string } = {
        standard: 'price_1Rd4BJQBVpuGZ9PNhp5y35FW',  // Replace with your actual Standard price ID
        premium: 'price_1Rd4BYQBVpuGZ9PNTxRRJlt8'   // Replace with your actual Premium price ID
      };
      return priceMap[plan];
    }
  }
 