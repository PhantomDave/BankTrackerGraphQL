namespace PhantomDave.BankTracking.Library.Models;

public class DashboardWidget
{
    public int Id { get; set; }
    public int DashboardId { get; set; }
    public WidgetType Type { get; set; }
    public int X { get; set; }
    public int Y { get; set; }
    public int Rows { get; set; }
    public int Cols { get; set; }
}

public enum WidgetType
{
    CurrentBalance,
    NetGraph
}