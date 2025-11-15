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
using Microsoft.EntityFrameworkCore;
using PhantomDave.BankTracking.Data.Context;
using PhantomDave.BankTracking.Library.Models;
using HotChocolate.Types;
using OfficeOpenXml;

namespace PhantomDave.BankTracking.Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        ExcelPackage.License.SetNonCommercialPersonal("BankTracker Developer");


        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not configured.");
        builder.Services.AddDataAccess(connectionString);

        builder.Services.AddScoped<AccountService>();
        builder.Services.AddScoped<FinanceRecordService>();
        builder.Services.AddScoped<FileImportService>();
        builder.Services.AddScoped<ColumnDetectionService>();
        builder.Services.AddHttpContextAccessor();
        builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
        builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();

        // Register background service for recurring records
        builder.Services.AddHostedService<RecurringFinanceRecordService>();

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
                // WARNING: RequireHttpsMetadata should be true in production environments
                // Set to false only for local development
                options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
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
                    .WithOrigins("http://localhost:4200", "http://localhost:5095")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials());
        });

        var graphqlBuilder = builder.Services
            .AddGraphQLServer()
            .AddAuthorization()
            .AddQueryType()
            .AddMutationType()
            .AddType<UploadType>()
            .BindRuntimeType<RecurrenceFrequency, EnumType<RecurrenceFrequency>>()
            .ModifyRequestOptions(options =>
            {
                options.IncludeExceptionDetails = builder.Environment.IsDevelopment();
            });

        RegisterTypeExtensions(graphqlBuilder, typeof(Program).Assembly);

        var app = builder.Build();

        using (var scope = app.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<BankTrackerDbContext>();
            dbContext.Database.Migrate();
        }

        app.UseCors();

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapGraphQL()
            .WithOptions(new GraphQLServerOptions
            {
                Tool = {
                    Enable = builder.Environment.IsDevelopment()
                }
            });


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