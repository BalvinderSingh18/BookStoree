using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Migrations
{
    /// <inheritdoc />
    public partial class _AddDiscussion_ColumnOn_TaskManagementTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskManagments_AbpUsers_UserId",
                table: "TaskManagments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TaskManagments",
                table: "TaskManagments");

            // REMOVE or COMMENT this line if AssignedUserId doesn't exist
            // migrationBuilder.DropColumn(
            //     name: "AssignedUserId",
            //     table: "TaskManagments");

            migrationBuilder.RenameTable(
                name: "TaskManagments",
                newName: "taskManagments");

            migrationBuilder.RenameIndex(
                name: "IX_TaskManagments_UserId",
                table: "taskManagments",
                newName: "IX_taskManagments_UserId");

            migrationBuilder.AlterColumn<long>(
                name: "UserId",
                table: "taskManagments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Discussion",
                table: "taskManagments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_taskManagments",
                table: "taskManagments",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_taskManagments_AbpUsers_UserId",
                table: "taskManagments",
                column: "UserId",
                principalTable: "AbpUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_taskManagments_AbpUsers_UserId",
                table: "taskManagments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_taskManagments",
                table: "taskManagments");

            migrationBuilder.DropColumn(
                name: "Discussion",
                table: "taskManagments");

            migrationBuilder.RenameTable(
                name: "taskManagments",
                newName: "TaskManagments");

            migrationBuilder.RenameIndex(
                name: "IX_taskManagments_UserId",
                table: "TaskManagments",
                newName: "IX_TaskManagments_UserId");

            migrationBuilder.AlterColumn<long>(
                name: "UserId",
                table: "TaskManagments",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddColumn<long>(
                name: "AssignedUserId",
                table: "TaskManagments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddPrimaryKey(
                name: "PK_TaskManagments",
                table: "TaskManagments",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskManagments_AbpUsers_UserId",
                table: "TaskManagments",
                column: "UserId",
                principalTable: "AbpUsers",
                principalColumn: "Id");
        }
    }
}
