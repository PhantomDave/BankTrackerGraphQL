using PhantomDave.BankTracking.Data.UnitOfWork;
using PhantomDave.BankTracking.Library.Models;
using Microsoft.EntityFrameworkCore;

namespace PhantomDave.BankTracking.Api.Services;

public class ConfigurationService
{
    private readonly IUnitOfWork _unitOfWork;

    public ConfigurationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Configuration?> GetConfigurationById(int id)
    {
        var config = await _unitOfWork.Configurations
            .Query()
            .Include(c => c.RuleValues)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        return config;
    }

    public async Task<IEnumerable<Configuration?>> GetAllConfigurationsAsync(int accountId)
    {
        return await _unitOfWork.Configurations.GetByPredicateAsync(cfg => cfg.AccountId == accountId);
    }
    
    public async Task<Configuration> UpdateConfigurationAsync(int accountId, Configuration updatedConfig)
    {
        var existingConfig = await _unitOfWork.Configurations
            .GetSingleOrDefaultAsync(c => c.AccountId == accountId && c.RuleName == updatedConfig.RuleName);

        if (existingConfig == null)
        {
            throw new InvalidOperationException("Configuration not found for the given account and rule name.");
        }

        existingConfig = updatedConfig;

        await _unitOfWork.Configurations.UpdateAsync(existingConfig);
        await _unitOfWork.SaveChangesAsync();
        return existingConfig;
    }
    
    public async Task<Configuration> CreateConfigurationAsync(Configuration newConfig)
    {
        await _unitOfWork.Configurations.AddAsync(newConfig);
        await _unitOfWork.SaveChangesAsync();
        return newConfig;
    }
}
