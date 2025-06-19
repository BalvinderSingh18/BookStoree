import { Component } from '@angular/core';
import { CommonModule } from '@node_modules/@angular/common';
import { CurrencyExchangeServiceServiceProxy } from '@shared/service-proxies/service-proxies';
import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'app-currencyexchange',
  standalone: true,
  imports: [SharedModule,CommonModule],
  templateUrl: './currencyexchange.component.html',
  styleUrl: './currencyexchange.component.css'
})
export class CurrencyexchangeComponent {
 fromCurrency = 'USD';
  toCurrency = 'INR';
  amount: number = 1;
  convertedAmount: number | null = null;
  loading = false;
  error = '';
 
  currencies: string[] = ['USD', 'INR', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CNY'];
 
  constructor(private exchangeService: CurrencyExchangeServiceServiceProxy) {}
 
  convert() {
    this.loading = true;
    this.error = '';
    this.exchangeService
      .convertAmount(this.fromCurrency, this.toCurrency, this.amount)
      .subscribe({
        next: (result) => {
          this.convertedAmount = result;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message;
          this.loading = false;
        }
      });
  }
}

