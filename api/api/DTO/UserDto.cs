using System.Diagnostics.CodeAnalysis;

namespace SPI.DTO;

[ExcludeFromCodeCoverage] // A tenhle atribut přímo nad třídu
public class UserDto
{
    public string Name { get; set; }
    public string UserName { get; set; }
    public int Role { get; set; }
}
