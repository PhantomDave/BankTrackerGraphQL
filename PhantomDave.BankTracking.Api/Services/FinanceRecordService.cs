using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using PhantomDave.BankTracking.Api.Types.ObjectTypes;
using PhantomDave.BankTracking.Data.UnitOfWork;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Services;

public class FinanceRecordService
{
    private readonly IUnitOfWork _unitOfWork;

    public FinanceRecordService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public Task<FinanceRecord?> GetFinanceRecordAsync(int id) =>
        _unitOfWork.FinanceRecords.GetByIdAsync(id);

    public async Task<IEnumerable<FinanceRecord>> GetFinanceRecordsForAccountAsync(
        int accountId,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var query = _unitOfWork.FinanceRecords
            .Query()
            .AsNoTracking()
            .Where(record => record.AccountId == accountId);

        if (startDate.HasValue)
        {
            query = query.Where(record => record.Date >= EnsureUtc(startDate.Value));
        }

        if (endDate.HasValue)
        {
            query = query.Where(record => record.Date <= EnsureUtc(endDate.Value));
        }

        return await query
            .OrderByDescending(record => record.Date)
            .ThenByDescending(record => record.Id)
            .ToListAsync();
    }

    public async Task<FinanceRecord?> CreateFinanceRecordAsync(
        int accountId,
        decimal amount,
        string name,
        string currency,
        string? description,
        DateTime? date,
        bool isRecurring,
        RecurrenceFrequency? recurrenceFrequency = null,
        DateTime? recurrenceEndDate = null)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(accountId);
        if (account is null)
        {
            return null;
        }

        var normalizedCurrency = NormalizeCurrency(currency);
        if (normalizedCurrency.Length is 0 or > 3)
        {
            return null;
        }

        var record = new FinanceRecord
        {
            AccountId = accountId,
            Amount = amount,
            Name = name,
            Currency = normalizedCurrency,
            Description = NormalizeDescription(description),
            Date = EnsureUtc(date ?? DateTime.UtcNow),
            IsRecurring = isRecurring,
            RecurrenceFrequency = recurrenceFrequency ?? RecurrenceFrequency.None,
            RecurrenceEndDate = recurrenceEndDate.HasValue ? EnsureUtc(recurrenceEndDate.Value) : null
        };

        await _unitOfWork.FinanceRecords.AddAsync(record);
        await _unitOfWork.SaveChangesAsync();

        return record;
    }

    public async Task<FinanceRecord?> UpdateFinanceRecordAsync(
        int id,
        decimal? amount = null,
        string? currency = null,
        string? description = null,
        DateTime? date = null,
        bool? isRecurring = null,
        string? name = null,
        RecurrenceFrequency? recurrenceFrequency = null,
        DateTime? recurrenceEndDate = null)
    {
        var record = await _unitOfWork.FinanceRecords.GetByIdAsync(id);
        if (record is null)
        {
            return null;
        }

        if (amount.HasValue)
        {
            record.Amount = amount.Value;
        }

        if (!string.IsNullOrWhiteSpace(currency))
        {
            var normalizedCurrency = NormalizeCurrency(currency);
            if (normalizedCurrency.Length is 0 or > 3)
            {
                return null;
            }

            record.Currency = normalizedCurrency;
        }

        if (description is not null)
        {
            record.Description = NormalizeDescription(description);
        }

        if (date.HasValue)
        {
            record.Date = EnsureUtc(date.Value);
        }

        if (isRecurring.HasValue)
        {
            record.IsRecurring = isRecurring.Value;
        }

        if (name is not null)
        {
            record.Name = name;
        }

        if (recurrenceFrequency.HasValue)
        {
            record.RecurrenceFrequency = recurrenceFrequency.Value;
        }

        if (recurrenceEndDate.HasValue)
        {
            record.RecurrenceEndDate = EnsureUtc(recurrenceEndDate.Value);
        }

        await _unitOfWork.FinanceRecords.UpdateAsync(record);
        await _unitOfWork.SaveChangesAsync();

        return record;
    }

    public async Task<bool> DeleteFinanceRecordAsync(int id)
    {
        var deleted = await _unitOfWork.FinanceRecords.DeleteAsync(id);
        if (!deleted)
        {
            return false;
        }

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    private static string NormalizeCurrency(string currency)
    {
        return string.IsNullOrWhiteSpace(currency)
            ? string.Empty
            : currency.Trim().ToUpperInvariant();
    }

    private static string NormalizeDescription(string? description)
    {
        if (string.IsNullOrWhiteSpace(description))
        {
            return string.Empty;
        }

        var trimmed = description.Trim();
        return trimmed.Length <= 500 ? trimmed : trimmed[..500];
    }

    private static DateTime EnsureUtc(DateTime value)
    {
        return value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Unspecified => DateTime.SpecifyKind(value, DateTimeKind.Utc),
            _ => value.ToUniversalTime()
        };
    }

    private sealed record DuplicateKey(DateTime Date, decimal Amount, string Description);

    private static List<DuplicateKey> CreateDuplicateKeys(IEnumerable<FinanceRecord> records)
    {
        return records
            .Select(record => new DuplicateKey(
                EnsureUtc(record.Date),
                record.Amount,
                NormalizeDescription(record.Description)))
            .Distinct()
            .ToList();
    }

    public async Task<List<FinanceRecord>> FindDuplicatesAsync(
        int accountId,
        List<FinanceRecord> candidates)
    {
        var candidateKeys = CreateDuplicateKeys(candidates);
        if (candidateKeys.Count == 0)
        {
            return new List<FinanceRecord>();
        }

        var allRecords = await _unitOfWork.FinanceRecords.Query()
            .Where(r => r.AccountId == accountId)
            .ToListAsync();

        var dupes = allRecords
            .Where(record => candidateKeys.Contains(new DuplicateKey(
                EnsureUtc(record.Date),
                record.Amount,
                NormalizeDescription(record.Description))))
            .ToList();

        return dupes;
    }

    public async Task<ImportResultType> BulkCreateWithDuplicateCheckAsync(
        int accountId,
        List<FinanceRecord> records)
    {
        var normalizedCandidates = records
            .Select(record => new
            {
                Record = record,
                Key = new DuplicateKey(
                    EnsureUtc(record.Date),
                    record.Amount,
                    NormalizeDescription(record.Description))
            })
            .ToList();

        var recordKeys = normalizedCandidates.Select(candidate => candidate.Key).ToList();

        var allRecords = await _unitOfWork.FinanceRecords.Query()
            .Where(r => r.AccountId == accountId)
            .ToListAsync();

        var dupes = allRecords
            .Where(record => recordKeys.Contains(new DuplicateKey(
                EnsureUtc(record.Date),
                record.Amount,
                NormalizeDescription(record.Description))))
            .ToList();

        var error = new List<ImportError>();

        foreach (var record in dupes)
        {
            error.Add(new ImportError
            {
                Message = $"Duplicate record found for {record.Name} at {record.Amount} {record.Date}."
            });
        }

        var existingKeys = CreateDuplicateKeys(dupes);
        var recordsToAdd = normalizedCandidates
            .Where(candidate => !existingKeys.Contains(candidate.Key))
            .Select(candidate => candidate.Record)
            .ToList();


        var addResult = (await _unitOfWork.FinanceRecords.AddRangeAsync(recordsToAdd)).ToArray();
        await _unitOfWork.SaveChangesAsync();

        return new ImportResultType
        {
            CreatedRecords = addResult.Select(FinanceRecordType.FromFinanceRecord).ToList(),
            DuplicateCount = dupes.Count,
            Errors = error,
            FailureCount = error.Count,
            SuccessCount = addResult.Length
        };
    }
}
