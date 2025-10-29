using Microsoft.EntityFrameworkCore;
using PhantomDave.BankTracking.Library.Models;

namespace PhantomDave.BankTracking.Data.Context;

public class BankTrackerDbContext : DbContext
{
    public BankTrackerDbContext(DbContextOptions<BankTrackerDbContext> options) 
        : base(options)
    {
    }

    public DbSet<Account> Accounts => Set<Account>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Entity configurations here
        ConfigureAccount(modelBuilder);
    }

    private static void ConfigureAccount(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Id).ValueGeneratedOnAdd();
        });
    }
}

