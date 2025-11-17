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
    private static readonly string DatabaseName = $"InMemoryTestDb_{Guid.NewGuid()}";

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

            // Remove ALL DbContext-related services to avoid provider conflicts
            // We need to remove all EF Core service registrations
            var contextDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(BankTrackerDbContext));
            if (contextDescriptor != null)
            {
                services.Remove(contextDescriptor);
            }

            // Remove all DbContextOptions registrations
            var optionsDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<BankTrackerDbContext>));
            if (optionsDescriptor != null)
            {
                services.Remove(optionsDescriptor);
            }

            // Remove the DbContextOptions<BankTrackerDbContext> configurator
            var optionsBuilderDescriptor = services.SingleOrDefault(d => 
                d.ServiceType == typeof(Microsoft.EntityFrameworkCore.Infrastructure.IDbContextOptionsExtension));
            if (optionsBuilderDescriptor != null)
            {
                services.Remove(optionsBuilderDescriptor);
            }
            
            // Create a new service provider for EF Core with only InMemory provider
            var efServiceProvider = new ServiceCollection()
                .AddEntityFrameworkInMemoryDatabase()
                .BuildServiceProvider();

            // Re-register with InMemory database using the isolated service provider
            // Use a static database name so all tests in the class share the same database
            services.AddDbContext<BankTrackerDbContext>((sp, options) =>
            {
                options.UseInMemoryDatabase(DatabaseName)
                       .UseInternalServiceProvider(efServiceProvider);
            });

            // Configure GraphQL to include exception details in tests
            services.AddGraphQLServer()
                .ModifyRequestOptions(opt => opt.IncludeExceptionDetails = true);

            // Configure JWT Bearer to not require HTTPS metadata in tests
            services.PostConfigure<Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerOptions>(
                Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme,
                options =>
                {
                    options.RequireHttpsMetadata = false;
                });

            // For integration tests, configure authorization to allow anonymous access
            // This bypasses the [Authorize] attribute requirement
            services.AddAuthorization(options =>
            {
                options.DefaultPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
                    .RequireAssertion(_ => true) // Always return true, effectively allowing all requests
                    .Build();
            });
        });

        builder.UseEnvironment("Testing");
    }
}
