using System.Diagnostics.CodeAnalysis;

namespace SPI.DTO;

[ExcludeFromCodeCoverage] // A tenhle atribut přímo nad třídu
public class LoginRequestDto
{
    public required string UserName { get; set; }
    public required string Password { get; set; }
}
