using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Types.ObjectTypes;

public class DashboardWidgetType
{
    public int Id { get; set; }
    public WidgetType WidgetType { get; set; }
    public string? Title { get; set; }
    public string? Subtitle { get; set; }
    public string? Configuration { get; set; }
    public int Cols { get; set; }
    public int Rows { get; set; }
    public int X { get; set; }
    public int Y { get; set; }

    public static DashboardWidgetType FromDashboardWidget(DashboardWidget widget)
    {
        return new DashboardWidgetType
        {
            Id = widget.Id,
            WidgetType = widget.Type,
            Title = widget.Title,
            Subtitle = widget.Subtitle,
            Configuration = widget.Config,
            Cols = widget.Cols,
            Rows = widget.Rows,
            X = widget.X,
            Y = widget.Y,
        };
    }
}