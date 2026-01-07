using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class verificationTokenDbSet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_VerificationToken_VerificationTokenUserId",
                table: "Users");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_VerificationToken_UserId",
                table: "VerificationToken");

            migrationBuilder.DropPrimaryKey(
                name: "PK_VerificationToken",
                table: "VerificationToken");

            migrationBuilder.RenameTable(
                name: "VerificationToken",
                newName: "VerificationTokens");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_VerificationTokens_UserId",
                table: "VerificationTokens",
                column: "UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_VerificationTokens",
                table: "VerificationTokens",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_VerificationTokens_VerificationTokenUserId",
                table: "Users",
                column: "VerificationTokenUserId",
                principalTable: "VerificationTokens",
                principalColumn: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_VerificationTokens_VerificationTokenUserId",
                table: "Users");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_VerificationTokens_UserId",
                table: "VerificationTokens");

            migrationBuilder.DropPrimaryKey(
                name: "PK_VerificationTokens",
                table: "VerificationTokens");

            migrationBuilder.RenameTable(
                name: "VerificationTokens",
                newName: "VerificationToken");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_VerificationToken_UserId",
                table: "VerificationToken",
                column: "UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_VerificationToken",
                table: "VerificationToken",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_VerificationToken_VerificationTokenUserId",
                table: "Users",
                column: "VerificationTokenUserId",
                principalTable: "VerificationToken",
                principalColumn: "UserId");
        }
    }
}
