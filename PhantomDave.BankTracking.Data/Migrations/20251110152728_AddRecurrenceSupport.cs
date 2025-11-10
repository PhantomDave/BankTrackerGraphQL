using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhantomDave.BankTracking.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRecurrenceSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRecurringInstance",
                table: "FinanceRecords",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastProcessedDate",
                table: "FinanceRecords",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParentRecurringRecordId",
                table: "FinanceRecords",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RecurrenceEndDate",
                table: "FinanceRecords",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecurrenceFrequency",
                table: "FinanceRecords",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRecurringInstance",
                table: "FinanceRecords");

            migrationBuilder.DropColumn(
                name: "LastProcessedDate",
                table: "FinanceRecords");

            migrationBuilder.DropColumn(
                name: "ParentRecurringRecordId",
                table: "FinanceRecords");

            migrationBuilder.DropColumn(
                name: "RecurrenceEndDate",
                table: "FinanceRecords");

            migrationBuilder.DropColumn(
                name: "RecurrenceFrequency",
                table: "FinanceRecords");
        }
    }
}
