using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NikoGhalam.Web.Migrations
{
    /// <inheritdoc />
    public partial class addrefId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentRefId",
                table: "Invoices",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentRefId",
                table: "Invoices");
        }
    }
}
