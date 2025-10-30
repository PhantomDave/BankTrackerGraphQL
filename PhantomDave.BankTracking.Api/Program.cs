using System.Reflection;
using HotChocolate.Execution.Configuration;
using PhantomDave.BankTracking.Api.Services;
using PhantomDave.BankTracking.Data.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.DependencyInjection;
using HotChocolate.AspNetCore;
using HotChocolate.Authorization;

namespace PhantomDave.BankTracking.Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not configured.");
        builder.Services.AddDataAccess(connectionString);

        // Register services
        builder.Services.AddScoped<AccountService>();
        builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
        builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();

        // Authentication & Authorization
        var jwtSection = builder.Configuration.GetSection("Jwt");
        var secret = jwtSection["Secret"];
        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new InvalidOperationException("JWT Secret is not configured. Please set Jwt:Secret in configuration.");
        }
        var issuer = jwtSection["Issuer"];
        var audience = jwtSection["Audience"];
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

        builder.Services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false; // enable HTTPS in production
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = !string.IsNullOrWhiteSpace(issuer),
                    ValidIssuer = issuer,
                    ValidateAudience = !string.IsNullOrWhiteSpace(audience),
                    ValidAudience = audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(1)
                };
            });

        builder.Services.AddAuthorization();

        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
                policy
                    .WithOrigins("http://localhost:4200")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials());
        });

        var graphqlBuilder = builder.Services
            .AddGraphQLServer()
            .AddAuthorization()
            .AddQueryType()
            .AddMutationType();

        // Auto-register all type extensions from the current assembly
        RegisterTypeExtensions(graphqlBuilder, typeof(Program).Assembly);

        var app = builder.Build();

        // Abilita CORS prima del mapping GraphQL
        app.UseCors();

        // Authentication/Authorization middleware
        app.UseAuthentication();
        app.UseAuthorization();

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