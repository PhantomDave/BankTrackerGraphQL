using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Types.ObjectTypes;

public class DashboardType
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public List<DashboardWidgetType> Widgets { get; set; } = [];


    public static DashboardType FromDashboard(Dashboard dashboard)
    {
        return new DashboardType
        {
            Id = dashboard.Id,
            Name = dashboard.Name,
            Widgets = [.. dashboard.Widgets
                .Select(DashboardWidgetType.FromDashboardWidget)]
        };
    }
}