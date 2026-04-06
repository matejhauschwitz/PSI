using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EFModels.Migrations
{
    /// <inheritdoc />
    public partial class AddUserRoleAndAdminSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Role",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Delete admin user
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserName",
                keyValue: "admin");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");
        }
    }
}
