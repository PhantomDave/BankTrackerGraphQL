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
            .Include(d => d.Widgets)
            .Where(d => d.AccountId == accountId)
            .OrderBy(d => d.Id)
            .ToListAsync();

        return dashboards.Select(DashboardType.FromDashboard);
    }

    [Authorize]
    public async Task<DashboardType?> GetDashboard(
        int id,
        [Service] IUnitOfWork unitOfWork,
        [Service] IHttpContextAccessor httpContextAccessor)
    {
        var accountId = httpContextAccessor.GetAccountIdFromContext();

        var dashboard = await unitOfWork.Dashboards
            .Query()
            .Include(d => d.Widgets)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (dashboard is null || dashboard.AccountId != accountId)
        {
            return null;
        }

        return DashboardType.FromDashboard(dashboard);
    }
}
