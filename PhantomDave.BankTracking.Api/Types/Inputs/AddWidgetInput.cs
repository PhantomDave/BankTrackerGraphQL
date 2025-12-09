using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Types.Inputs;

public sealed class AddWidgetInput
{
    public int DashboardId { get; init; }
    public WidgetType Type { get; init; }
    public int X { get; init; }
    public int Y { get; init; }
    public int Rows { get; init; }
    public int Cols { get; init; }
}
