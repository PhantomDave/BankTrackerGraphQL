using HotChocolate;
using HotChocolate.Authorization;
using Microsoft.AspNetCore.Http;
using PhantomDave.BankTracking.Api.Services;
using PhantomDave.BankTracking.Api.Types.ObjectTypes;
using PhantomDave.BankTracking.Api.Types.Inputs;

namespace PhantomDave.BankTracking.Api.Types.Mutations;

/// <summary>
/// GraphQL mutations for Account operations
/// </summary>
[ExtendObjectType(OperationTypeNames.Mutation)]
public class FinanceRecordMutations
{
    /// <summary>
    /// Create a new finance record
    /// </summary>
    [Authorize]
    public async Task<FinanceRecordType> CreateFinanceRecord(
        CreateFinanceRecordInput newRecord,
        [Service] FinanceRecordService financeRecordService,
        [Service] IHttpContextAccessor httpContextAccessor)
    {
        if (newRecord is null)
        {
            throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Finance record data is required.")
                    .SetCode("BAD_USER_INPUT")
                    .Build());
        }

        var accountId = httpContextAccessor.GetAccountIdFromContext();

        var createdRecord = await financeRecordService.CreateFinanceRecordAsync(
            accountId,
            newRecord.Amount,
            newRecord.Name,
            newRecord.Currency,
            newRecord.Description,
            newRecord.Date,
            newRecord.IsRecurring,
            newRecord.RecurrenceFrequency,
            newRecord.RecurrenceEndDate) ?? throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Failed to create finance record. Please check the provided data.")
                    .SetCode("BAD_USER_INPUT")
                    .Build());
        return FinanceRecordType.FromFinanceRecord(createdRecord);
    }

    /// <summary>
    /// Update an existing finance record
    /// </summary>
    [Authorize]
    public async Task<FinanceRecordType> UpdateFinanceRecord(
        int id,
        decimal? amount,
        string? currency,
        string? description,
        DateTime? date,
        bool? isRecurring,
        string? name,
        Library.Models.RecurrenceFrequency? recurrenceFrequency,
        DateTime? recurrenceEndDate,
        [Service] FinanceRecordService financeRecordService)
    {
        var updatedRecord = await financeRecordService.UpdateFinanceRecordAsync(
            id,
            amount,
            currency,
            description,
            date,
            isRecurring,
            name,
            recurrenceFrequency,
            recurrenceEndDate) ?? throw new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Failed to update finance record. Please check the provided data.")
                    .SetCode("BAD_USER_INPUT")
                    .Build());
        return FinanceRecordType.FromFinanceRecord(updatedRecord);
    }

    [Authorize]
    public async Task<bool> DeleteFinanceRecord(
        int id,
        [Service] FinanceRecordService financeRecordService)
    {
        var deletedRecord = await financeRecordService.DeleteFinanceRecordAsync(id);
        if (!deletedRecord)
        {
            throw new GraphQLException(
            ErrorBuilder.New()
                .SetMessage("Failed to delete finance record. Please check the provided data.")
                .SetCode("BAD_USER_INPUT")
                .Build());
        }
        return deletedRecord;
    }
}