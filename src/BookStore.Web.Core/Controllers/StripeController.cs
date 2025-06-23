using BookStore.Stripe;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Controllers
{
    [Route("api/stripe")]
    [ApiController]
    public class StripeController:BookStoreControllerBase
    {
        private readonly StripeAppService _stripeAppService;

        public StripeController(StripeAppService stripeAppService)
        {
            _stripeAppService = stripeAppService;
        }

        [HttpPost("create-session")]
        public async Task<IActionResult> CreateSession([FromBody] StripeSessionRequest input)
        {
            var url = await _stripeAppService.CreateCheckoutSessionAsync(input.PriceId);
            return Content(url, "text/plain");  // Sends raw string, not JSON
                                                // now valid, returns plain text to frontend
        }
    }
}
