using PhantomDave.BankTracking.Data.Context;
using PhantomDave.BankTracking.Data.Repositories;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Data.UnitOfWork;

public interface IUnitOfWork : IAsyncDisposable
{
    IRepository<Account> Accounts { get; }
    IRepository<Configuration> Configurations { get; }
    IRepository<RuleValue> RuleValues { get; }
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}

public class UnitOfWork : IUnitOfWork
{
    private readonly BankTrackerDbContext _context;
    private IRepository<Account>? _accounts;
    private IRepository<Configuration>? _configurations;
    private IRepository<RuleValue>? _ruleValues;

    public UnitOfWork(BankTrackerDbContext context)
    {
        _context = context;
    }

    public IRepository<Account> Accounts =>
        _accounts ??= new Repository<Account>(_context);
    public IRepository<Configuration> Configurations =>
        _configurations ??= new Repository<Configuration>(_context);
    public IRepository<RuleValue> RuleValues =>
        _ruleValues ??= new Repository<RuleValue>(_context);

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        try
        {
            await _context.SaveChangesAsync();
            await _context.Database.CommitTransactionAsync();
        }
        catch
        {
            await _context.Database.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        await _context.Database.RollbackTransactionAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await _context.DisposeAsync();
    }
}

