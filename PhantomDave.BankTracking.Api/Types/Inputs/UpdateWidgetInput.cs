using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Types.Inputs;

public sealed class UpdateWidgetInput
{
    public int Id { get; init; }
    public WidgetType? Type { get; init; }
    public int? X { get; init; }
    public int? Y { get; init; }
    public int? Rows { get; init; }
    public int? Cols { get; init; }
    public string? Title { get; init; }
    public string? Subtitle { get; init; }
    public string? Config { get; init; }
}
