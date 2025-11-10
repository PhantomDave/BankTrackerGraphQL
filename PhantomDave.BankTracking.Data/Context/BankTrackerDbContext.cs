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
    public DbSet<FinanceRecord> FinanceRecords => Set<FinanceRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Entity configurations here
        ConfigureAccount(modelBuilder);
        ConfigureFinanceRecord(modelBuilder);
    }

    private static void ConfigureAccount(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Id).ValueGeneratedOnAdd();
        });
    }

    private static void ConfigureFinanceRecord(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FinanceRecord>(entity =>
        {
            entity.HasKey(fr => fr.Id);
            entity.Property(fr => fr.Id).ValueGeneratedOnAdd();
            entity.Property(fr => fr.Amount)
                .HasColumnType("numeric(18,2)");
            entity.Property(fr => fr.Currency)
                .IsRequired()
                .HasMaxLength(3);
            entity.Property(fr => fr.Description)
                .HasMaxLength(500);
            entity.HasOne<Account>()
                .WithMany()
                .HasForeignKey(fr => fr.AccountId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

