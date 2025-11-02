namespace PhantomDave.BankTracking.Library.Models;

public class Account
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public ICollection<Configuration> Configurations { get; set; } = new List<Configuration>();
}