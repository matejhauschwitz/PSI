namespace SPI.DTO;

public class CdbBookDto
{
    public string ISBN10 { get; set; }
    public string ISBN13 { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string Authors { get; set; }
    public string Categories { get; set; }
    public string Thumbnail { get; set; }
    public string Description { get; set; }
    public int published_year { get; set; }
    public double average_rating { get; set; }
    public int num_pages { get; set; }
    public int ratings_count { get; set; }
    public double price { get; set; }
}
