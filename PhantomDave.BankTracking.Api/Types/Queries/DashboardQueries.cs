using HotChocolate;
using HotChocolate.Authorization;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using PhantomDave.BankTracking.Api.Types.ObjectTypes;
using PhantomDave.BankTracking.Data.UnitOfWork;

namespace PhantomDave.BankTracking.Api.Types.Queries;

[ExtendObjectType(OperationTypeNames.Query)]
public class DashboardQueries
{
    [Authorize]
    public async Task<IEnumerable<DashboardType>> GetDashboards(
        [Service] IUnitOfWork unitOfWork,
        [Service] IHttpContextAccessor httpContextAccessor)
    {
        var accountId = httpContextAccessor.GetAccountIdFromContext();

        var dashboards = await unitOfWork.Dashboards
            .Query()
            .Where(d => d.AccountId == accountId)
            .OrderBy(d => d.Id)
            .ToListAsync();

        foreach (var dashboard in dashboards)
        {
            var widgets = await unitOfWork.DashboardWidgets
                .Query()
                .Where(w => w.DashboardId == dashboard.Id)
                .OrderBy(w => w.Id)
                .ToListAsync();
            dashboard.Widgets = widgets.ToList();
        }

        return dashboards.Select(DashboardType.FromDashboard);
    }

    [Authorize]
    public async Task<DashboardType?> GetDashboard(
        int id,
        [Service] IUnitOfWork unitOfWork,
        [Service] IHttpContextAccessor httpContextAccessor)
    {
        var accountId = httpContextAccessor.GetAccountIdFromContext();

        var dashboard = await unitOfWork.Dashboards.GetByIdAsync(id);
        if (dashboard is null || dashboard.AccountId != accountId)
        {
            return null;
        }

        var widgets = await unitOfWork.DashboardWidgets
            .Query()
            .Where(w => w.DashboardId == dashboard.Id)
            .OrderBy(w => w.Id)
            .ToListAsync();
        dashboard.Widgets = widgets.ToList();

        return DashboardType.FromDashboard(dashboard);
    }
}
