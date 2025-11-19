using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class permissionid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_PermissionClaims",
                table: "PermissionClaims");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "PermissionClaims",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0)
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PermissionClaims",
                table: "PermissionClaims",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionClaims_Role",
                table: "PermissionClaims",
                column: "Role");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_PermissionClaims",
                table: "PermissionClaims");

            migrationBuilder.DropIndex(
                name: "IX_PermissionClaims_Role",
                table: "PermissionClaims");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "PermissionClaims");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PermissionClaims",
                table: "PermissionClaims",
                column: "Role");
        }
    }
}
