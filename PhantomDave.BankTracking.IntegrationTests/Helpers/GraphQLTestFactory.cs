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
                ["Jwt:Secret"] = "ThisIsASecretKeyForTestingPurposesOnly123456789",
                ["Jwt:Issuer"] = "BankTrackerTestIssuer",
                ["Jwt:Audience"] = "BankTrackerTestAudience",
                ["Jwt:ExpiryMinutes"] = "60"
            });
        });

        builder.ConfigureTestServices(services =>
        {
            // Remove the RecurringFinanceRecordService hosted service to avoid DB provider conflicts
            var hostedServiceDescriptors = services.Where(d => 
                d.ServiceType == typeof(Microsoft.Extensions.Hosting.IHostedService))
                .ToList();
            
            foreach (var descriptor in hostedServiceDescriptors)
            {
                services.Remove(descriptor);
            }

            // Remove the existing DbContext registration added by AddDataAccess
            var dbContextDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<BankTrackerDbContext>));
            while (dbContextDescriptor != null)
            {
                services.Remove(dbContextDescriptor);
                dbContextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<BankTrackerDbContext>));
            }

            // Also remove the BankTrackerDbContext registration itself
            var contextDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(BankTrackerDbContext));
            while (contextDescriptor != null)
            {
                services.Remove(contextDescriptor);
                contextDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(BankTrackerDbContext));
            }
            
            // Re-register with InMemory database - this replaces what AddDataAccess did
            services.AddDbContext<BankTrackerDbContext>(options =>
            {
                options.UseInMemoryDatabase($"InMemoryTestDb_{Guid.NewGuid()}");
            });

            // Configure GraphQL to include exception details in tests
            services.AddGraphQLServer()
                .ModifyRequestOptions(opt => opt.IncludeExceptionDetails = true);
        });

        builder.UseEnvironment("Testing");
    }
}
