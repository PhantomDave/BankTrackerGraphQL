using HotChocolate;
using HotChocolate.Types;
using PhantomDave.BankTracking.Api.Types.Inputs;
using PhantomDave.BankTracking.Api.Types.ObjectTypes;
using PhantomDave.BankTracking.Data.UnitOfWork;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Types.Mutations;

[ExtendObjectType(OperationTypeNames.Mutation)]
public class DashboardMutations
{
    public async Task<DashboardType> CreateDashboard(
        [Service] IUnitOfWork unitOfWork,
        [Service] IHttpContextAccessor httpContextAccessor,
        CreateDashboardInput input)
    {
        var accountId = httpContextAccessor.GetAccountIdFromContext();

        var name = input.Name?.Trim() ?? string.Empty;
        if (name.Length > 100)
        {
            name = name[..100];
        }

        var dashboard = new Dashboard
        {
            AccountId = accountId,
            Name = name
        };

        await unitOfWork.Dashboards.AddAsync(dashboard);
        await unitOfWork.SaveChangesAsync();

        return DashboardType.FromDashboard(dashboard);
    }

    public async Task<DashboardType> UpdateDashboard(
        [Service] IUnitOfWork unitOfWork,
        [Service] IHttpContextAccessor httpContextAccessor,
        UpdateDashboardInput input)
    {
        var accountId = httpContextAccessor.GetAccountIdFromContext();

        var dashboard = await unitOfWork.Dashboards.GetByIdAsync(input.Id);
        if (dashboard == null || dashboard.AccountId != accountId)
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Dashboard not found.")
                    .SetCode("NOT_FOUND")
                    .Build());
        }

        if (input.Name != null)
        {
            var name = input.Name.Trim();
            if (name.Length > 100)
            {
                name = name[..100];
            }
            dashboard.Name = name;
        }

        await unitOfWork.SaveChangesAsync();

        return DashboardType.FromDashboard(dashboard);
    }

    public async Task<bool> DeleteDashboard(
        [Service] IUnitOfWork unitOfWork,
        [Service] IHttpContextAccessor httpContextAccessor,
        int id)
    {
        var accountId = httpContextAccessor.GetAccountIdFromContext();

        var dashboard = await unitOfWork.Dashboards.GetByIdAsync(id);
        if (dashboard == null || dashboard.AccountId != accountId)
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Dashboard not found.")
                    .SetCode("NOT_FOUND")
                    .Build());
        }

        await unitOfWork.Dashboards.DeleteAsync(id);
        await unitOfWork.SaveChangesAsync();

        return true;
    }
}