using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhantomDave.BankTracking.Data.Migrations
{
    /// <inheritdoc />
    /// <remarks>
    /// This migration permanently removes the Title, Subtitle, and Config columns from the DashboardWidgets table.
    /// Widget customization is now handled client-side, with only position and size persisted server-side.
    /// WARNING: Any existing data in these columns will be permanently lost. 
    /// Ensure data is backed up or migrated before applying this migration in production.
    /// </remarks>
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
