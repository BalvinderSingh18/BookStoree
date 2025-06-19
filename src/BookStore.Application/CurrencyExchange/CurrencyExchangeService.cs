using Abp.Application.Services;
using Abp.UI;
using BookStore.CurrencyExchange.Dtos;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.CurrencyExchange
{
    public class CurrencyExchangeService : ApplicationService, ICurrencyExchangeService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private const string ApiKey = "aa919ec850b0c29156de6650";
        private const string BaseUrl = "https://v6.exchangerate-api.com/v6";
        private static readonly MemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
        public CurrencyExchangeService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<decimal> GetExchangeRateAsync(string fromCurrency, string toCurrency)
        {
            var client = _httpClientFactory.CreateClient();
            var url = $"{BaseUrl}/{ApiKey}/latest/{fromCurrency}";

            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                throw new UserFriendlyException("Currency API failed.");
            }

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonConvert.DeserializeObject<ExchangeRateApiResponse>(json);

            if (data.result != "success" || !data.conversion_rates.ContainsKey(toCurrency))
            {
                throw new UserFriendlyException($"Exchange rate not available for {fromCurrency} to {toCurrency}.");
            }

            return data.conversion_rates[toCurrency];
        }
        public async Task<decimal> ConvertAmountAsync(string fromCurrency, string toCurrency, decimal amount)
        {

            var rate = await GetExchangeRateAsync(fromCurrency, toCurrency);
            return rate * amount;
        }
    }
}
