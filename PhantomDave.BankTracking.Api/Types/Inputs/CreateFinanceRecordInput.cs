using System;
using HotChocolate;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Api.Types.Inputs;

/// <summary>
/// Input payload for creating finance records; matches GraphQL FinanceRecordInput.
/// </summary>
[GraphQLName("FinanceRecordInput")]
public sealed class CreateFinanceRecordInput
{
    public int? Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DateTime? Date { get; init; }
    public bool IsRecurring { get; init; }
    public RecurrenceFrequency? RecurrenceFrequency { get; init; }
    public DateTime? RecurrenceEndDate { get; init; }
}
