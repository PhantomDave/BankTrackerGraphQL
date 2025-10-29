using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PhantomDave.BankTracking.Data.Context;

public sealed class BankTrackerDbContextFactory : IDesignTimeDbContextFactory<BankTrackerDbContext>
{
    public BankTrackerDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("CONNECTIONSTRINGS__DEFAULTCONNECTION")
            ?? Environment.GetEnvironmentVariable("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=bankdb;Username=bankuser;Password=bankpassword";

        var optionsBuilder = new DbContextOptionsBuilder<BankTrackerDbContext>();
        optionsBuilder.UseNpgsql(connectionString, npgsql =>
        {
            npgsql.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(10), errorCodesToAdd: null);
        });

        return new BankTrackerDbContext(optionsBuilder.Options);
    }
}
