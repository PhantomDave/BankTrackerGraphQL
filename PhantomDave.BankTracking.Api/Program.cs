using System.Reflection;
using HotChocolate.Execution.Configuration;
using PhantomDave.BankTracking.Api.Services;
using PhantomDave.BankTracking.Data.Extensions;

namespace PhantomDave.BankTracking.Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not configured.");
        builder.Services.AddDataAccess(connectionString);

        builder.Services.AddScoped<AccountService>();

        var graphqlBuilder = builder.Services
            .AddGraphQLServer()
            .AddQueryType()
            .AddMutationType();

        // Auto-register all type extensions from the current assembly
        RegisterTypeExtensions(graphqlBuilder, typeof(Program).Assembly);

        var app = builder.Build();

        app.MapGraphQL();

        app.RunWithGraphQLCommands(args);
    }

    private static void RegisterTypeExtensions(IRequestExecutorBuilder builder, Assembly assembly)
    {
        var typeExtensions = assembly.GetTypes()
            .Where(t => t.GetCustomAttribute<ExtendObjectTypeAttribute>() != null)
            .ToList();

        foreach (var type in typeExtensions)
        {
            builder.AddTypeExtension(type);
        }
    }
}