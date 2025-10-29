using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PhantomDave.BankTracking.Data.Context;
using PhantomDave.BankTracking.Data.Repositories;
using PhantomDave.BankTracking.Data.UnitOfWork;

namespace PhantomDave.BankTracking.Data.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDataAccess(
        this IServiceCollection services,
        string connectionString)
    {
        services.AddDbContext<BankTrackerDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorCodesToAdd: null);
            }));

        services.AddScoped<IUnitOfWork, UnitOfWork.UnitOfWork>();
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        return services;
    }
}

