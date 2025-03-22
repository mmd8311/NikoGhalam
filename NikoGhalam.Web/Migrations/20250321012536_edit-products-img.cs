using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NikoGhalam.Web.Migrations
{
    /// <inheritdoc />
    public partial class editproductsimg : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "ImageUrl",
                value: "/assets/images/product/Gold.Webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "ImageUrl",
                value: "/assets/images/product/Silver.Webp");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "ImageUrl",
                value: "/assets/images/product/Browns.Webp");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "ImageUrl",
                value: "/assets/images/product/Gold.Png");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "ImageUrl",
                value: "/assets/images/product/Silver.Png");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "ImageUrl",
                value: "/assets/images/product/Browns.Png");
        }
    }
}
