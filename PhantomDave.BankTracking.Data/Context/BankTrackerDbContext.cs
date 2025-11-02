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
    public DbSet<Configuration> Configurations => Set<Configuration>();
    public DbSet<RuleValue> RuleValues => Set<RuleValue>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureAccount(modelBuilder);
        ConfigureConfiguration(modelBuilder);
        ConfigureRuleValue(modelBuilder);
    }

    private static void ConfigureAccount(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Id).ValueGeneratedOnAdd();
        });
    }

    private static void ConfigureConfiguration(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Configuration>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Id).ValueGeneratedOnAdd();
            entity.Property(c => c.RuleName).IsRequired();

            entity
                .HasOne(c => c.Account)
                .WithMany(a => a.Configurations)
                .HasForeignKey(c => c.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasMany(c => c.RuleValues)
                .WithOne(rv => rv.Configuration)
                .HasForeignKey(rv => rv.ConfigurationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureRuleValue(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RuleValue>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Id).ValueGeneratedOnAdd();
            entity.Property(r => r.Name).IsRequired();
            entity.Property(r => r.ConfigurationId).IsRequired();
        });
    }
}
