using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using PhantomDave.BankTracking.Api.Extensions;
using PhantomDave.BankTracking.Api.Services;

namespace PhantomDave.BankTracking.Api.GraphQL.Configuration;

[ExtendObjectType(OperationTypeNames.Mutation)]
public class ConfigurationMutations
{
    [Authorize]
    public async Task<ConfigurationType> UpdateConfiguration(
        Library.Models.Configuration input,
        [Service] ConfigurationService configurationService,
        [Service] IHttpContextAccessor httpContextAccessor)
    {
        var userId = httpContextAccessor.HttpContext.GetUser().RequireUserId();
        var updatedConfig = await configurationService.UpdateConfigurationAsync(userId, input);
        return ConfigurationType.FromConfiguration(updatedConfig);
    }
    
    [Authorize]
    public async Task<ConfigurationType> CreateConfiguration(
        Library.Models.Configuration input,
        [Service] ConfigurationService configurationService,
        [Service] IHttpContextAccessor httpContextAccessor)
    {
        var userId = httpContextAccessor.HttpContext.GetUser().RequireUserId();
        input.AccountId = userId;
        var createdConfig = await configurationService.CreateConfigurationAsync(input);
        return ConfigurationType.FromConfiguration(createdConfig);
    }
}