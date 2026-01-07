using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class categorykeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ListingId",
                table: "ListingCategories",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ListingCategories_ListingId",
                table: "ListingCategories",
                column: "ListingId");

            migrationBuilder.AddForeignKey(
                name: "FK_ListingCategories_Listings_ListingId",
                table: "ListingCategories",
                column: "ListingId",
                principalTable: "Listings",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListingCategories_Listings_ListingId",
                table: "ListingCategories");

            migrationBuilder.DropIndex(
                name: "IX_ListingCategories_ListingId",
                table: "ListingCategories");

            migrationBuilder.DropColumn(
                name: "ListingId",
                table: "ListingCategories");
        }
    }
}
