namespace PhantomDave.BankTracking.Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.AddGraphQL().AddTypes();
        builder.Services.AddGraphQLServer();

        var app = builder.Build();


        app.MapGraphQL();

        app.RunWithGraphQLCommands(args);
    }
}