using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhantomDave.BankTracking.Data.Migrations
{
    /// <inheritdoc />
    public partial class refactoredmigrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_RuleValues_ConfigurationId",
                table: "RuleValues",
                column: "ConfigurationId");

            migrationBuilder.AddForeignKey(
                name: "FK_RuleValues_Configurations_ConfigurationId",
                table: "RuleValues",
                column: "ConfigurationId",
                principalTable: "Configurations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RuleValues_Configurations_ConfigurationId",
                table: "RuleValues");

            migrationBuilder.DropIndex(
                name: "IX_RuleValues_ConfigurationId",
                table: "RuleValues");
        }
    }
}
