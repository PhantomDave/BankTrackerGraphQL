namespace PhantomDave.BankTracking.Library.Models;

public class Configuration
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public Account? Account { get; set; }
    public string RuleName { get; set; } = string.Empty;
    public ICollection<RuleValue> RuleValues { get; set; } = new List<RuleValue>();
}