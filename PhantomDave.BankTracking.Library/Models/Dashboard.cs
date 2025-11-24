namespace PhantomDave.BankTracking.Library.Models;

public class Dashboard
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<DashboardWidget> Widgets { get; set; } = [];
}