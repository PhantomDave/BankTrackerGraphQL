using HotChocolate.Authorization;
using PhantomDave.BankTracking.Api.ObjectTypes;
using PhantomDave.BankTracking.Api.Services;


namespace PhantomDave.BankTracking.Api.Types.Queries;

public class FinanceRecordQueries
{
    /// <summary>   
    /// Get All Finance Records for an Account
    /// </summary>
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