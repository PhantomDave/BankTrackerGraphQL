using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhantomDave.BankTracking.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRequiredNameAndCurrencyDefaults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Backfill existing NULL values before applying NOT NULL constraints
            migrationBuilder.Sql("UPDATE \"FinanceRecords\" SET \"Name\" = 'Untitled' WHERE \"Name\" IS NULL OR \"Name\" = ''");
            migrationBuilder.Sql("UPDATE \"FinanceRecords\" SET \"Currency\" = 'USD' WHERE \"Currency\" IS NULL OR \"Currency\" = ''");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "FinanceRecords",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "Untitled",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                table: "FinanceRecords",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "USD",
                oldClrType: typeof(string),
                oldType: "character varying(3)",
                oldMaxLength: 3);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "FinanceRecords",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldDefaultValue: "Untitled");

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                table: "FinanceRecords",
                type: "character varying(3)",
                maxLength: 3,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(3)",
                oldMaxLength: 3,
                oldDefaultValue: "USD");
        }
    }
}
