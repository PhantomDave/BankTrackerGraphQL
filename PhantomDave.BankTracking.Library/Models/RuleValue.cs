using System.ComponentModel.DataAnnotations;

namespace PhantomDave.BankTracking.Library.Models;

public class RuleValue
{
    public int Id { get; set; }
    public int ConfigurationId { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;
    public int Value { get; set; }

    // Reference navigation to parent Configuration
    public Configuration? Configuration { get; set; }
}