namespace SPI.DTO;

public class BooksResponse
{
    public int TotalRecords { get; set; }
    public int TotalPages { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public required List<BookSimpleDto> Books { get; set; }

    public BooksResponse() { }

}
