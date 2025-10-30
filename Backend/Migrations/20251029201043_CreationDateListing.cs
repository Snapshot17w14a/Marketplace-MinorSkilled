using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class CreationDateListing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Listings",
                type: "TEXT",
                nullable: false,
                defaultValue: "CURRENT_TIMESTAMP");

            migrationBuilder.Sql("UPDATE Listings SET CreatedAt = CURRENT_TIMESTAMP WHERE CreatedAt IT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Listings");
        }
    }
}
