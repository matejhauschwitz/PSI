using System.ComponentModel.DataAnnotations;

namespace EFModels.Models;

public class Book
{
    [Key]
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
    public bool IsHidden { get; set; } = false;
    public double? Price { get; set; }
    public ICollection<Comment> Comments { get; set; }
    public ICollection<User> Users { get; set; }
    public ICollection<Order> Orders { get; set; }
    public ICollection<Genre> Genres { get; set; } = new HashSet<Genre>();
    public DateTime LastUpdated { get; set; } = DateTime.Now;


    public override string ToString()
    {
        return $"{Title} by {Authors}";
    }
}
