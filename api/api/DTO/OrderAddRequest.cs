using System.Diagnostics.CodeAnalysis;
using EFModels.Enums;

namespace SPI.DTO;

[ExcludeFromCodeCoverage] // A tenhle atribut přímo nad třídu
public class OrderAddRequest
{
    public List<int> bookIds { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
}
