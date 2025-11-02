using PhantomDave.BankTracking.Api.Extensions;
using PhantomDave.BankTracking.Api.Services;

namespace PhantomDave.BankTracking.Api.GraphQL.Configuration;

[ExtendObjectType(OperationTypeNames.Query)]
public class ConfigurationQueries
{
    public async Task<IEnumerable<ConfigurationType>> GetConfigurations(
        [Service] ConfigurationService configurationService,
        [Service] IHttpContextAccessor httpContextAccessor)
    {
        var userId = httpContextAccessor.HttpContext.GetUser().RequireUserId();
        var configurations = await configurationService.GetAllConfigurationsAsync(userId);
        return configurations
            .Where(c => c is not null)
            .Select(c => ConfigurationType.FromConfiguration(c!));
    }   
    
    public async Task<ConfigurationType?> GetConfigurationById(
        int id,
        [Service] ConfigurationService configurationService)
    {
        var config = await configurationService.GetConfigurationById(id);
        return config != null ? ConfigurationType.FromConfiguration(config) : null;
    }
}