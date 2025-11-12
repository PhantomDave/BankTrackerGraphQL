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
    public DbSet<BankImportTemplate>  BankImportTemplates => Set<BankImportTemplate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Entity configurations here
        ConfigureAccount(modelBuilder);
        ConfigureFinanceRecord(modelBuilder);
        ConfigureBankImportTemplate(modelBuilder);
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

    private static void ConfigureBankImportTemplate(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BankImportTemplate>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Id).ValueGeneratedOnAdd();
            
            entity.Property(t => t.BankName)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.Property(t => t.ColumnMappings)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, string>()
                );
            
            entity.Property(t => t.DateFormat)
                .IsRequired()
                .HasMaxLength(50);
            
            entity.Property(t => t.DecimalSeparator)
                .IsRequired()
                .HasMaxLength(1);
            
            entity.Property(t => t.ThousandsSeparator)
                .IsRequired()
                .HasMaxLength(1);
            
            entity.Property(t => t.IsDefault)
                .IsRequired();
            
            entity.Property(t => t.CreatedAt)
                .IsRequired();
            
            entity.Property(t => t.UpdatedAt);
            
            entity.HasOne<Account>()
                .WithMany()
                .HasForeignKey(t => t.AccountId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(t => new { t.AccountId, t.BankName });
            entity.HasIndex(t => new { t.AccountId, t.IsDefault });
        });
    }
}

