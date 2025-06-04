using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookStore.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUnqiuefromTaskNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
           name: "IX_Tasks_Task_Number",
           table: "Tasks");

            // Recreate the index as non-unique
            migrationBuilder.CreateIndex(
                name: "IX_Tasks_Task_Number",
                table: "Tasks",
                column: "Task_Number");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
           name: "IX_Tasks_Task_Number",
           table: "Tasks");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_Task_Number",
                table: "Tasks",
                column: "Task_Number",
                unique: true);
        }
    }
}
