using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class explicitcategorylink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ListingCategoriesRelations");

            migrationBuilder.CreateTable(
                name: "ListingCategoryRelation",
                columns: table => new
                {
                    ListingId = table.Column<int>(type: "INTEGER", nullable: false),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListingCategoryRelation", x => new { x.ListingId, x.CategoryId });
                    table.ForeignKey(
                        name: "FK_ListingCategoryRelation_ListingCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "ListingCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListingCategoryRelation_Listings_ListingId",
                        column: x => x.ListingId,
                        principalTable: "Listings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ListingCategoryRelation_CategoryId",
                table: "ListingCategoryRelation",
                column: "CategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ListingCategoryRelation");

            migrationBuilder.CreateTable(
                name: "ListingCategoriesRelations",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    ListingId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListingCategoriesRelations", x => new { x.CategoryId, x.ListingId });
                    table.ForeignKey(
                        name: "FK_ListingCategoriesRelations_ListingCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "ListingCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListingCategoriesRelations_Listings_ListingId",
                        column: x => x.ListingId,
                        principalTable: "Listings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ListingCategoriesRelations_ListingId",
                table: "ListingCategoriesRelations",
                column: "ListingId");
        }
    }
}
