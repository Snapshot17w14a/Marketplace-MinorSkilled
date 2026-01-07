using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class categoriessimplemtm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListingCategories_Listings_ListingId",
                table: "ListingCategories");

            migrationBuilder.DropTable(
                name: "ListingCategoryConnectors");

            migrationBuilder.DropIndex(
                name: "IX_ListingCategories_ListingId",
                table: "ListingCategories");

            migrationBuilder.DropColumn(
                name: "ListingId",
                table: "ListingCategories");

            migrationBuilder.CreateTable(
                name: "ListingCategoriesRelations",
                columns: table => new
                {
                    ListingCategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    ListingId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListingCategoriesRelations", x => new { x.ListingCategoryId, x.ListingId });
                    table.ForeignKey(
                        name: "FK_ListingCategoriesRelations_ListingCategories_ListingCategoryId",
                        column: x => x.ListingCategoryId,
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

            migrationBuilder.CreateTable(
                name: "ListingListingCategory",
                columns: table => new
                {
                    CategoriesId = table.Column<int>(type: "INTEGER", nullable: false),
                    ListingsId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListingListingCategory", x => new { x.CategoriesId, x.ListingsId });
                    table.ForeignKey(
                        name: "FK_ListingListingCategory_ListingCategories_CategoriesId",
                        column: x => x.CategoriesId,
                        principalTable: "ListingCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListingListingCategory_Listings_ListingsId",
                        column: x => x.ListingsId,
                        principalTable: "Listings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ListingCategoriesRelations_ListingId",
                table: "ListingCategoriesRelations",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_ListingListingCategory_ListingsId",
                table: "ListingListingCategory",
                column: "ListingsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ListingCategoriesRelations");

            migrationBuilder.DropTable(
                name: "ListingListingCategory");

            migrationBuilder.AddColumn<int>(
                name: "ListingId",
                table: "ListingCategories",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ListingCategoryConnectors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ListingCategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    ListingId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListingCategoryConnectors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListingCategoryConnectors_ListingCategories_ListingCategoryId",
                        column: x => x.ListingCategoryId,
                        principalTable: "ListingCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListingCategoryConnectors_Listings_ListingId",
                        column: x => x.ListingId,
                        principalTable: "Listings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ListingCategories_ListingId",
                table: "ListingCategories",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_ListingCategoryConnectors_ListingCategoryId",
                table: "ListingCategoryConnectors",
                column: "ListingCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ListingCategoryConnectors_ListingId",
                table: "ListingCategoryConnectors",
                column: "ListingId");

            migrationBuilder.AddForeignKey(
                name: "FK_ListingCategories_Listings_ListingId",
                table: "ListingCategories",
                column: "ListingId",
                principalTable: "Listings",
                principalColumn: "Id");
        }
    }
}
