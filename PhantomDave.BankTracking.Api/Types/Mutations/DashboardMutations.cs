using HotChocolate;
using HotChocolate.Authorization;
using HotChocolate.Types;
using PhantomDave.BankTracking.Api.Types.Inputs;
using PhantomDave.BankTracking.Api.Types.ObjectTypes;
using PhantomDave.BankTracking.Data.UnitOfWork;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Types.Mutations;

[ExtendObjectType(OperationTypeNames.Mutation)]
public class DashboardMutations
{
    private const int MaxDashboardNameLength = 100;

    private static string TruncateName(string? name)
    {
        var trimmed = name?.Trim() ?? string.Empty;
        return trimmed.Length > MaxDashboardNameLength ? trimmed[..MaxDashboardNameLength] : trimmed;
    }

    [Authorize]
    public async Task<DashboardType> CreateDashboard(
        [Service] IUnitOfWork unitOfWork,
        [Service] IHttpContextAccessor httpContextAccessor,
        CreateDashboardInput input)
    {
        var accountId = httpContextAccessor.GetAccountIdFromContext();

        var trimmedName = TruncateName(input.Name);
        if (string.IsNullOrEmpty(trimmedName))
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Dashboard name cannot be empty.")
                    .SetCode("BAD_USER_INPUT")
                    .Build());
        }

        var dashboard = new Dashboard
        {
            AccountId = accountId,
            Name = trimmedName
        };

        await unitOfWork.Dashboards.AddAsync(dashboard);
        await unitOfWork.SaveChangesAsync();

        return DashboardType.FromDashboard(dashboard);
    }

    [Authorize]
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
            dashboard.Name = TruncateName(input.Name);
        }

        await unitOfWork.Dashboards.UpdateAsync(dashboard);
        await unitOfWork.SaveChangesAsync();

        return DashboardType.FromDashboard(dashboard);
    }

    [Authorize]
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