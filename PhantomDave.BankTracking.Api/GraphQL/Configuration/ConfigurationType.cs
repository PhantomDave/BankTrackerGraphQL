using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.GraphQL.Configuration;

public class ConfigurationType
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public string RuleName { get; set; } = string.Empty;
    public IEnumerable<RuleValue>? RuleValues { get; set; }

    /// <summary>
    /// Factory method to convert a domain Configuration model to a GraphQL ConfigurationType
    /// </summary>
    public static ConfigurationType FromConfiguration(Library.Models.Configuration configuration) => new()
    {
        Id = configuration.Id,
        AccountId = configuration.AccountId,
        RuleName = configuration.RuleName,
        RuleValues = configuration.RuleValues,
    };
}