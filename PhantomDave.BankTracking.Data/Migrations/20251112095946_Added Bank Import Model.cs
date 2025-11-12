using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PhantomDave.BankTracking.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedBankImportModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BankImportTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AccountId = table.Column<int>(type: "integer", nullable: false),
                    BankName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ColumnMappings = table.Column<string>(type: "jsonb", nullable: false),
                    DateFormat = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DecimalSeparator = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: false),
                    ThousandsSeparator = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BankImportTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BankImportTemplates_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BankImportTemplates_AccountId_BankName",
                table: "BankImportTemplates",
                columns: new[] { "AccountId", "BankName" });

            migrationBuilder.CreateIndex(
                name: "IX_BankImportTemplates_AccountId_IsDefault",
                table: "BankImportTemplates",
                columns: new[] { "AccountId", "IsDefault" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BankImportTemplates");
        }
    }
}
