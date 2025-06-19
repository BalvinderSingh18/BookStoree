using Abp.Application.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.CurrencyExchange
{
    public interface ICurrencyExchangeService:IApplicationService
    {
        Task<decimal> GetExchangeRateAsync(string fromCurrency, string toCurrency);
        Task<decimal> ConvertAmountAsync(string fromCurrency, string toCurrency, decimal amount);
    }
}
