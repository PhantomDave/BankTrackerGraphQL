using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhantomDave.BankTracking.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountIdToDashboard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AccountId",
                table: "Dashboards",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Dashboards_AccountId",
                table: "Dashboards",
                column: "AccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_Dashboards_Accounts_AccountId",
                table: "Dashboards",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Dashboards_Accounts_AccountId",
                table: "Dashboards");

            migrationBuilder.DropIndex(
                name: "IX_Dashboards_AccountId",
                table: "Dashboards");

            migrationBuilder.DropColumn(
                name: "AccountId",
                table: "Dashboards");
        }
    }
}
