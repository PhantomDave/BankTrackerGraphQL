using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhantomDave.BankTracking.Data.Migrations
{
    /// <inheritdoc />
    public partial class Addedbalancefieldtoaccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CurrentBalance",
                table: "Accounts",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentBalance",
                table: "Accounts");
        }
    }
}
