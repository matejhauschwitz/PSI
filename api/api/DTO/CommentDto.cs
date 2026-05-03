using System.Diagnostics.CodeAnalysis;

namespace SPI.DTO;

[ExcludeFromCodeCoverage] // A tenhle atribut přímo nad třídu
public class CommentDto
{
    public string Content { get; set; }
    public DateTime CreatedDate { get; set; }
    public string CreatorUserName { get; set; }
    public double rating { get; set; }
}
