using Microsoft.EntityFrameworkCore;
using PhantomDave.BankTracking.Data.Context;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Services;

public class RecurringFinanceRecordService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RecurringFinanceRecordService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1); // Check every hour

    public RecurringFinanceRecordService(
        IServiceProvider serviceProvider,
        ILogger<RecurringFinanceRecordService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Recurring Finance Record Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessRecurringRecordsAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Task cancellation requested, exit the loop gracefully.
                break;
            }
            catch (Exception ex)
            {
                if (ex is OutOfMemoryException ||
                    ex is StackOverflowException ||
                    ex is ThreadAbortException)
                {
                    throw;
                }
                _logger.LogError(ex, "Error occurred while processing recurring records.");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Recurring Finance Record Service is stopping.");
    }

    private async Task ProcessRecurringRecordsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BankTrackerDbContext>();

        var now = DateTime.UtcNow;

        // Get all recurring records that need processing
        var recurringRecords = await dbContext.FinanceRecords
            .Where(r => r.IsRecurring &&
                       r.RecurrenceFrequency != RecurrenceFrequency.None &&
                       (r.RecurrenceEndDate == null || r.RecurrenceEndDate > now))
            .ToListAsync(cancellationToken);

        foreach (var record in recurringRecords)
        {
            try
            {
                await ProcessSingleRecurringRecordAsync(dbContext, record, now, cancellationToken);
            }
            catch (OperationCanceledException)
            {
                // Operation was cancelled—rethrow to respect cancellation request.
                throw;
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error processing recurring record ID {RecordId}", record.Id);
            }
            // Removed generic catch. All other exceptions will propagate.
        }

        if (recurringRecords.Any())
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Processed {Count} recurring records.", recurringRecords.Count);
        }
    }

    private async Task ProcessSingleRecurringRecordAsync(
        BankTrackerDbContext dbContext,
        FinanceRecord recurringRecord,
        DateTime now,
        CancellationToken cancellationToken)
    {
        var lastProcessed = recurringRecord.LastProcessedDate ?? recurringRecord.Date;
        var nextDueDate = CalculateNextDueDate(lastProcessed, recurringRecord.RecurrenceFrequency);

        while (nextDueDate <= now &&
               (recurringRecord.RecurrenceEndDate == null || nextDueDate <= recurringRecord.RecurrenceEndDate))
        {
            var existingInstance = await dbContext.FinanceRecords
                .AnyAsync(r => r.ParentRecurringRecordId == recurringRecord.Id &&
                              r.Date.Date == nextDueDate.Date,
                         cancellationToken);

            if (!existingInstance)
            {
                var newInstance = new FinanceRecord
                {
                    AccountId = recurringRecord.AccountId,
                    Name = recurringRecord.Name,
                    Amount = recurringRecord.Amount,
                    Currency = recurringRecord.Currency,
                    Description = recurringRecord.Description,
                    Date = nextDueDate,
                    IsRecurring = false,
                    IsRecurringInstance = true,
                    ParentRecurringRecordId = recurringRecord.Id,
                    RecurrenceFrequency = RecurrenceFrequency.None
                };

                dbContext.FinanceRecords.Add(newInstance);
                _logger.LogInformation(
                    "Created recurring instance for record ID {RecordId} on {Date}",
                    recurringRecord.Id,
                    nextDueDate);
            }

            recurringRecord.LastProcessedDate = nextDueDate;
            nextDueDate = CalculateNextDueDate(nextDueDate, recurringRecord.RecurrenceFrequency);
        }
    }

    private static DateTime CalculateNextDueDate(DateTime currentDate, RecurrenceFrequency frequency)
    {
        return frequency switch
        {
            RecurrenceFrequency.Daily => currentDate.AddDays(1),
            RecurrenceFrequency.Weekly => currentDate.AddDays(7),
            RecurrenceFrequency.Monthly => currentDate.AddMonths(1),
            RecurrenceFrequency.Yearly => currentDate.AddYears(1),
            _ => currentDate
        };
    }
}
