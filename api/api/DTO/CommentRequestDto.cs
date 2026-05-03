using System.Diagnostics.CodeAnalysis;

namespace SPI.DTO;

[ExcludeFromCodeCoverage] // A tenhle atribut přímo nad třídu
public class CommentRequestDto
{
    public string content { get; set; }
    public int bookId { get; set; }
    public double rating { get; set; }
}
