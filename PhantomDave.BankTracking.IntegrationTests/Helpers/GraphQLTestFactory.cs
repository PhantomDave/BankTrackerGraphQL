using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using PhantomDave.BankTracking.Data.Context;

namespace PhantomDave.BankTracking.IntegrationTests.Helpers;

public class GraphQLTestFactory : WebApplicationFactory<PhantomDave.BankTracking.Api.Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Database=banktrackertest;Username=test;Password=test",
                ["Jwt:Secret"] = "ThisIsASecretKeyForTestingPurposesOnly123456789",
                ["Jwt:Issuer"] = "BankTrackerTestIssuer",
                ["Jwt:Audience"] = "BankTrackerTestAudience",
                ["Jwt:ExpiryMinutes"] = "60"
            });
        });

        builder.ConfigureTestServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<BankTrackerDbContext>));
            
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }
            
            services.AddDbContext<BankTrackerDbContext>(options =>
            {
                options.UseInMemoryDatabase("InMemoryTestDb");
            });
        });

        builder.UseEnvironment("Testing");
    }
}
