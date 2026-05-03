using System.Diagnostics.CodeAnalysis;

namespace SPI.DTO;

[ExcludeFromCodeCoverage] // A tenhle atribut přímo nad třídu
public class AddressDto
{
    public string StreetAddress { get; set; }
    public string City { get; set; }
    public string Zip { get; set; }
    public string Country { get; set; }
}
