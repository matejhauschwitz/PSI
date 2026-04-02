namespace SPI.DTO;

public class BookSimpleDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string Authors { get; set; }
    public string Genre { get; set; }
    public string CoverImageUrl { get; set; }
    public int PublicationYear { get; set; }
    public double Rating { get; set; }
    public int TotalRatings { get; set; }
    public bool IsHidden { get; set; }
    public double? Price { get; set; }
}
