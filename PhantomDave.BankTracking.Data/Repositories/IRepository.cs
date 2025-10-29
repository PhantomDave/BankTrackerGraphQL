using Microsoft.EntityFrameworkCore;

namespace PhantomDave.BankTracking.Data.Repositories;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(object id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task<bool> DeleteAsync(object id);
    Task<T?> GetSingleOrDefaultAsync(Func<T, bool> predicate);
    Task SaveAsync();
    IQueryable<T> Query();
}

public class Repository<T> : IRepository<T> where T : class
{
    private readonly DbContext _context;
    private readonly DbSet<T> _dbSet;

    public Repository(DbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(object id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        return entity;
    }

    public async Task<T> UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        return entity;
    }

    public async Task<bool> DeleteAsync(object id)
    {
        var entity = await GetByIdAsync(id);
        if (entity == null)
            return false;

        _dbSet.Remove(entity);
        return true;
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }
    
    public async Task<T?> GetSingleOrDefaultAsync(Func<T, bool> predicate)
    {
        return await _context.FindAsync<T>(predicate);
    }

    public IQueryable<T> Query()
    {
        return _dbSet.AsQueryable();
    }
}

