using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class rolespermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "TEXT",
                nullable: false,
                defaultValue: "Member");

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    Role = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => x.Role);
                });

            migrationBuilder.CreateTable(
                name: "PermissionClaims",
                columns: table => new
                {
                    Role = table.Column<string>(type: "TEXT", nullable: false),
                    Permission = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PermissionClaims", x => x.Role);
                    table.ForeignKey(
                        name: "FK_PermissionClaims_UserRoles_Role",
                        column: x => x.Role,
                        principalTable: "UserRoles",
                        principalColumn: "Role",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Role",
                table: "Users",
                column: "Role");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_UserRoles_Role",
                table: "Users",
                column: "Role",
                principalTable: "UserRoles",
                principalColumn: "Role",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.Sql("INSERT OR IGNORE INTO UserRoles (Role) VALUES ('Member');");
            migrationBuilder.Sql("INSERT OR IGNORE INTO UserRoles (Role) VALUES ('Admin');");

            // Fix existing users WITHOUT a matching role
            // Assign default role "User"
            migrationBuilder.Sql(@"
                UPDATE Users
                SET Role = 'Member'
                WHERE Role IS NULL 
                   OR Role NOT IN (SELECT Role FROM UserRoles);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_UserRoles_Role",
                table: "Users");

            migrationBuilder.DropTable(
                name: "PermissionClaims");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropIndex(
                name: "IX_Users_Role",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");

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
    }
}
