using Abp.Application.Services;
using Abp.UI;
using Stripe.Checkout;
using Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace BookStore.Stripe
{
    public class StripeAppService:ApplicationService
    {
        private readonly IConfiguration _configuration;

        public StripeAppService(IConfiguration configuration)
        {
            _configuration = configuration;

            var secretKey = _configuration["Stripe:SecretKey"];
            if (string.IsNullOrWhiteSpace(secretKey))
            {
                throw new Exception("Stripe secret key is missing in configuration.");
            }

            StripeConfiguration.ApiKey = secretKey;
        }

        public async Task<string> CreateCheckoutSessionAsync(string priceId)
        {
            try
            {
                var options = new SessionCreateOptions
                {
                    PaymentMethodTypes = new List<string> { "card" },
                    LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        Price = priceId,
                        Quantity = 1
                    }
                },
                    Mode = "subscription",
                    SuccessUrl = "http://localhost:4200/account/register?session_id={CHECKOUT_SESSION_ID}",
                    CancelUrl = "http://localhost:4200/account/select-edition"
                };

                var service = new SessionService();
                var session = await service.CreateAsync(options);

                return session.Url;
            }
            catch (Exception ex)
            {
                Logger.Error("Stripe session creation failed", ex);
                throw new UserFriendlyException("Stripe session creation failed: " + ex.Message);
            }
        }
    }
}