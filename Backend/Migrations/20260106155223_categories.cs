using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class categories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ListingCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Category = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListingCategories", x => x.Id);
                });

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
                name: "IX_ListingCategoryConnectors_ListingCategoryId",
                table: "ListingCategoryConnectors",
                column: "ListingCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ListingCategoryConnectors_ListingId",
                table: "ListingCategoryConnectors",
                column: "ListingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ListingCategoryConnectors");

            migrationBuilder.DropTable(
                name: "ListingCategories");
        }
    }
}
