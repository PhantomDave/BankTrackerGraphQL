using HotChocolate;
using HotChocolate.Authorization;
using HotChocolate.Types;
using PhantomDave.BankTracking.Api.Types.Inputs;
using PhantomDave.BankTracking.Api.Types.ObjectTypes;
using PhantomDave.BankTracking.Data.UnitOfWork;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Types.Mutations;

[ExtendObjectType(OperationTypeNames.Mutation)]
public class DashboardWidgetMutations
{
    [Authorize]
    public async Task<DashboardWidgetType> AddWidget(
        [Service] IUnitOfWork unitOfWork,
        [Service] IHttpContextAccessor httpContextAccessor,
        AddWidgetInput input)
    {
        var accountId = httpContextAccessor.GetAccountIdFromContext();

        var dashboard = await unitOfWork.Dashboards.GetByIdAsync(input.DashboardId);
        if (dashboard is null || dashboard.AccountId != accountId)
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Dashboard not found.")
                    .SetCode("NOT_FOUND")
                    .Build());
        }

        if (input.Rows <= 0 || input.Cols <= 0)
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Widget rows and cols must be greater than 0.")
                    .SetCode("BAD_USER_INPUT")
                    .Build());
        }

        var widget = new DashboardWidget
        {
            DashboardId = input.DashboardId,
            Type = input.Type,
            X = Math.Max(0, input.X),
            Y = Math.Max(0, input.Y),
            Rows = input.Rows,
            Cols = input.Cols,
            Title = input.Title?.Trim(),
            Subtitle = input.Subtitle?.Trim(),
            Config = input.Config
        };

        await unitOfWork.DashboardWidgets.AddAsync(widget);
        await unitOfWork.SaveChangesAsync();

        return DashboardWidgetType.FromDashboardWidget(widget);
    }

    [Authorize]
    public async Task<DashboardWidgetType> UpdateWidget(
        [Service] IUnitOfWork unitOfWork,
        [Service] IHttpContextAccessor httpContextAccessor,
        UpdateWidgetInput input)
    {
        var accountId = httpContextAccessor.GetAccountIdFromContext();

        var widget = await unitOfWork.DashboardWidgets.GetByIdAsync(input.Id);
        if (widget is null)
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Widget not found.")
                    .SetCode("NOT_FOUND")
                    .Build());
        }

        var dashboard = await unitOfWork.Dashboards.GetByIdAsync(widget.DashboardId);
        if (dashboard is null || dashboard.AccountId != accountId)
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Widget not found.")
                    .SetCode("NOT_FOUND")
                    .Build());
        }

        if (input.Type.HasValue)
        {
            widget.Type = input.Type.Value;
        }

        if (input.X.HasValue)
        {
            widget.X = Math.Max(0, input.X.Value);
        }

        if (input.Y.HasValue)
        {
            widget.Y = Math.Max(0, input.Y.Value);
        }

        if (input.Rows.HasValue)
        {
            if (input.Rows.Value <= 0)
            {
                throw new GraphQLException(
                    ErrorBuilder.New()
                        .SetMessage("Widget rows must be greater than 0.")
                        .SetCode("BAD_USER_INPUT")
                        .Build());
            }

            widget.Rows = input.Rows.Value;
        }

        if (input.Cols.HasValue)
        {
            if (input.Cols.Value <= 0)
            {
                throw new GraphQLException(
                    ErrorBuilder.New()
                        .SetMessage("Widget cols must be greater than 0.")
                        .SetCode("BAD_USER_INPUT")
                        .Build());
            }

            widget.Cols = input.Cols.Value;
        }

        if (input.Title is not null)
        {
            widget.Title = input.Title.Trim();
        }

        if (input.Subtitle is not null)
        {
            widget.Subtitle = input.Subtitle.Trim();
        }

        if (input.Config is not null)
        {
            widget.Config = input.Config;
        }

        await unitOfWork.DashboardWidgets.UpdateAsync(widget);
        await unitOfWork.SaveChangesAsync();

        return DashboardWidgetType.FromDashboardWidget(widget);
    }

    [Authorize]
    public async Task<bool> RemoveWidget(
        [Service] IUnitOfWork unitOfWork,
        [Service] IHttpContextAccessor httpContextAccessor,
        int id)
    {
        var accountId = httpContextAccessor.GetAccountIdFromContext();

        var widget = await unitOfWork.DashboardWidgets.GetByIdAsync(id);
        if (widget is null)
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Widget not found.")
                    .SetCode("NOT_FOUND")
                    .Build());
        }

        var dashboard = await unitOfWork.Dashboards.GetByIdAsync(widget.DashboardId);
        if (dashboard is null || dashboard.AccountId != accountId)
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Widget not found.")
                    .SetCode("NOT_FOUND")
                    .Build());
        }

        await unitOfWork.DashboardWidgets.DeleteAsync(id);
        await unitOfWork.SaveChangesAsync();

        return true;
    }
}
