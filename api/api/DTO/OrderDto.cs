using System.Diagnostics.CodeAnalysis;
using EFModels.Enums;

namespace SPI.DTO;

[ExcludeFromCodeCoverage] // A tenhle atribut přímo nad třídu
public class OrderDto
{
    public int Id { get; set; }
    public List<BookSimpleDto> Books { get; set; }
    public DateTime Created { get; set; }
    public double totalPrice { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
    public OrderStatus? Status { get; set; }
    public string? UserSnapshot {get; set; }
    public string? UserName { get; set; }
}
