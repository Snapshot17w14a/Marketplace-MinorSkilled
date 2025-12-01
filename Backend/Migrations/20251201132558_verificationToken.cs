using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class verificationToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "VerificationTokenUserId",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "VerificationToken",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Token = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VerificationToken", x => x.Id);
                    table.UniqueConstraint("AK_VerificationToken_UserId", x => x.UserId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_VerificationTokenUserId",
                table: "Users",
                column: "VerificationTokenUserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_VerificationToken_VerificationTokenUserId",
                table: "Users",
                column: "VerificationTokenUserId",
                principalTable: "VerificationToken",
                principalColumn: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_VerificationToken_VerificationTokenUserId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "VerificationToken");

            migrationBuilder.DropIndex(
                name: "IX_Users_VerificationTokenUserId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "VerificationTokenUserId",
                table: "Users");
        }
    }
}
