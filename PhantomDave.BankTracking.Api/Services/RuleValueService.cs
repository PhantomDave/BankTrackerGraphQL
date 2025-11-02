using Microsoft.EntityFrameworkCore;
using PhantomDave.BankTracking.Data.UnitOfWork;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Services;

public class RuleValueService
{
    private readonly IUnitOfWork _unitOfWork;

    public RuleValueService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
    
    public async Task<IEnumerable<RuleValue?>> GetRuleByConfigId(int id)
    {
        return await _unitOfWork.RuleValues.GetByPredicateAsync(rv => rv.ConfigurationId == id);
    }

    public async Task<IEnumerable<RuleValue?>> GetRuleByAccountId(int id)
    {
        var ruleValues = _unitOfWork.RuleValues.Query().AsNoTracking();
        var configurations = _unitOfWork.Configurations.Query().AsNoTracking();

        return await ruleValues
            .Join(
                configurations,
                rv => rv.ConfigurationId,
                c => c.Id,
                (rv, c) => new { rv, c }
            )
            .Where(x => x.c.AccountId == id)
            .Select(x => (RuleValue?)x.rv)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<RuleValue>> UpdateRuleValuesAsync(int configurationId, IEnumerable<RuleValue> updatedConfig)
    {
        
        var deletingRuleValues = await _unitOfWork.RuleValues.ExecuteDeleteAsync(rv => rv.ConfigurationId == configurationId);
        if (deletingRuleValues <= 0)
        {
            throw new InvalidOperationException("Error deleting existing RuleValues for the given configuration.");
        }

        //Avoid multiple enumeration
        updatedConfig = updatedConfig.ToArray();
        await _unitOfWork.RuleValues.AddRangeAsync(updatedConfig);
        await _unitOfWork.SaveChangesAsync();
        return updatedConfig;
    }
}