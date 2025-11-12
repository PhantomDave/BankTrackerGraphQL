using HotChocolate.Authorization;
using Microsoft.EntityFrameworkCore;
using PhantomDave.BankTracking.Api.Services;
using PhantomDave.BankTracking.Api.Types.ObjectTypes;
using PhantomDave.BankTracking.Data.UnitOfWork;

namespace PhantomDave.BankTracking.Api.Types.Queries;

[ExtendObjectType(OperationTypeNames.Query)]
public class FinanceRecordQueries
{
    /// <summary>   
    /// Get All Finance Records for an Account
    /// </summary>
    [Authorize]
    public async Task<IEnumerable<FinanceRecordType>> GetFinanceRecordsForAccount(
        DateTime? startDate,
        DateTime? endDate,
        [Service] FinanceRecordService financeRecordService,
        [Service] IHttpContextAccessor httpContextAccessor)
    {
        var accountId = httpContextAccessor.GetAccountIdFromContext();
        var records = await financeRecordService.GetFinanceRecordsForAccountAsync(
            accountId,
            startDate,
            endDate);

        return records.Select(FinanceRecordType.FromFinanceRecord);
    }

    /// <summary>
    /// Get Single Finance Record
    /// </summary>
    [Authorize]
    public async Task<FinanceRecordType?> GetFinanceRecord(
        int id,
        [Service] FinanceRecordService financeRecordService)
    {
        if (id <= 0)
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Invalid finance record ID.")
                    .SetCode("BAD_USER_INPUT")
                    .SetExtension("field", "id")
                    .SetExtension("reason", "invalid_id")
                    .Build());
        }

        var financeRecord = await financeRecordService.GetFinanceRecordAsync(id) ?? throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Finance record not found.")
                    .SetCode("NOT_FOUND")
                    .SetExtension("field", "id")
                    .SetExtension("reason", "not_found")
                    .Build());

        return FinanceRecordType.FromFinanceRecord(financeRecord);
    }
}