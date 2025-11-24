using Microsoft.EntityFrameworkCore;
using PhantomDave.BankTracking.Data.UnitOfWork;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Services;

public class DashboardService
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public Task<Dashboard?> GetDashboardAsync(int id) =>
        _unitOfWork.Dashboards.GetByIdAsync(id);

    public async Task<IEnumerable<Dashboard>> GetAllDashboardsAsync()
    {
        var dashboards = await _unitOfWork.Dashboards
            .Query()
            .AsNoTracking()
            .OrderBy(d => d.Id)
            .ToListAsync();

        foreach (var dashboard in dashboards)
        {
            var widgets = await _unitOfWork.DashboardWidgets
                .Query()
                .Where(w => w.DashboardId == dashboard.Id)
                .OrderBy(w => w.Id)
                .ToListAsync();
            dashboard.Widgets = widgets.ToList();
        }

        return dashboards;
    }

    public async Task<Dashboard?> CreateDashboardAsync(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return null;
        }

        var normalizedName = NormalizeName(name);
        if (normalizedName.Length == 0)
        {
            return null;
        }

        var dashboard = new Dashboard
        {
            Name = normalizedName,
            Widgets = []
        };

        await _unitOfWork.Dashboards.AddAsync(dashboard);
        await _unitOfWork.SaveChangesAsync();

        return dashboard;
    }

    public async Task<Dashboard?> UpdateDashboardAsync(
        int id,
        string? name = null)
    {
        var dashboard = await _unitOfWork.Dashboards.GetByIdAsync(id);
        if (dashboard is null)
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(name))
        {
            var normalizedName = NormalizeName(name);
            if (normalizedName.Length == 0)
            {
                return null;
            }

            dashboard.Name = normalizedName;
        }

        await _unitOfWork.Dashboards.UpdateAsync(dashboard);
        await _unitOfWork.SaveChangesAsync();

        return dashboard;
    }

    public async Task<bool> DeleteDashboardAsync(int id)
    {
        var deleted = await _unitOfWork.Dashboards.DeleteAsync(id);
        if (!deleted)
        {
            return false;
        }

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<DashboardWidget?> AddWidgetAsync(
        int dashboardId,
        WidgetType type,
        int x,
        int y,
        int rows,
        int cols)
    {
        var dashboard = await _unitOfWork.Dashboards.GetByIdAsync(dashboardId);
        if (dashboard is null)
        {
            return null;
        }

        if (rows <= 0 || cols <= 0)
        {
            return null;
        }

        var widget = new DashboardWidget
        {
            DashboardId = dashboardId,
            Type = type,
            X = Math.Max(0, x),
            Y = Math.Max(0, y),
            Rows = rows,
            Cols = cols
        };

        await _unitOfWork.DashboardWidgets.AddAsync(widget);
        await _unitOfWork.SaveChangesAsync();

        return widget;
    }

    public async Task<DashboardWidget?> UpdateWidgetAsync(
        int id,
        WidgetType? type = null,
        int? x = null,
        int? y = null,
        int? rows = null,
        int? cols = null)
    {
        var widget = await _unitOfWork.DashboardWidgets.GetByIdAsync(id);
        if (widget is null)
        {
            return null;
        }

        if (type.HasValue)
        {
            widget.Type = type.Value;
        }

        if (x.HasValue)
        {
            widget.X = Math.Max(0, x.Value);
        }

        if (y.HasValue)
        {
            widget.Y = Math.Max(0, y.Value);
        }

        if (rows.HasValue)
        {
            if (rows.Value <= 0)
            {
                return null;
            }

            widget.Rows = rows.Value;
        }

        if (cols.HasValue)
        {
            if (cols.Value <= 0)
            {
                return null;
            }

            widget.Cols = cols.Value;
        }

        await _unitOfWork.DashboardWidgets.UpdateAsync(widget);
        await _unitOfWork.SaveChangesAsync();

        return widget;
    }

    public async Task<bool> RemoveWidgetAsync(int id)
    {
        var deleted = await _unitOfWork.DashboardWidgets.DeleteAsync(id);
        if (!deleted)
        {
            return false;
        }

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    private static string NormalizeName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return string.Empty;
        }

        var trimmed = name.Trim();
        return trimmed.Length <= 100 ? trimmed : trimmed[..100];
    }
}
