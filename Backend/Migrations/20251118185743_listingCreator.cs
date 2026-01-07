using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class listingCreator : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CreatorId",
                table: "Listings",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Listings_CreatorId",
                table: "Listings",
                column: "CreatorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Listings_Users_CreatorId",
                table: "Listings",
                column: "CreatorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Listings_Users_CreatorId",
                table: "Listings");

            migrationBuilder.DropIndex(
                name: "IX_Listings_CreatorId",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "Listings");
        }
    }
}
