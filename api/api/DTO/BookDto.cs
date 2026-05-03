using System.Diagnostics.CodeAnalysis;

namespace SPI.DTO;

[ExcludeFromCodeCoverage] // A tenhle atribut přímo nad třídu
public class BookDto
{
    public int Id { get; set; }
    public string ISBN10 { get; set; }
    public string ISBN13 { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string Authors { get; set; }
    public string Genre { get; set; }
    public string CoverImageUrl { get; set; }
    public string Description { get; set; }
    public int PublicationYear { get; set; }
    public double Rating { get; set; }
    public int PageCount { get; set; }
    public int TotalRatings { get; set; }
    public bool IsHidden { get; set; }
    public double? Price { get; set; }
    public List<CommentDto> comments { get; set; }
}
