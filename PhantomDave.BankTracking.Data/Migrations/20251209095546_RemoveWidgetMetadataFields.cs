using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhantomDave.BankTracking.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveWidgetMetadataFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Config",
                table: "DashboardWidgets");

            migrationBuilder.DropColumn(
                name: "Subtitle",
                table: "DashboardWidgets");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "DashboardWidgets");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Config",
                table: "DashboardWidgets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Subtitle",
                table: "DashboardWidgets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "DashboardWidgets",
                type: "text",
                nullable: true);
        }
    }
}
