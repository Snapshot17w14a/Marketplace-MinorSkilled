using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class categoriesreationsfix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ListingCategoryId",
                table: "ListingCategoriesRelations",
                newName: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_ListingCategoriesRelations_ListingCategories_CategoryId",
                table: "ListingCategoriesRelations",
                column: "CategoryId",
                principalTable: "ListingCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListingCategoriesRelations_ListingCategories_CategoryId",
                table: "ListingCategoriesRelations");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "ListingCategoriesRelations",
                newName: "ListingCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_ListingCategoriesRelations_ListingCategories_ListingCategoryId",
                table: "ListingCategoriesRelations",
                column: "ListingCategoryId",
                principalTable: "ListingCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
