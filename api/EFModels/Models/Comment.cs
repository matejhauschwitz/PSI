using System.ComponentModel.DataAnnotations;

namespace EFModels.Models;

public class Comment
{
    [Key]
    public int Id { get; set; }
    public string Content { get; set; }
    public DateTime CreatedDate { get; set; }
    public int BookId { get; set; }
    public Book Book { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }
    public double Rating { get; set; }
}
