using System.ComponentModel.DataAnnotations;

namespace EFModels.Models;

public class User
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; }
    public string UserName { get; set; }
    public string PasswordHash { get; set; }
    public Address? Address { get; set; }
    public Address? BillingAddress { get; set; }
    public bool? ProcessData { get; set; }
    public bool? IsMale { get; set; } //Genesis 1:27
    public DateTime? BirthDay { get; set; }
    public ICollection<Genre>? FavouriteGerners { get; set; } = new HashSet<Genre>();
    public string? Referral { get; set; }
    public string? Email { get; set; }

    public ICollection<Comment> Comments { get; set; }
    public ICollection<Book> FavouriteBooks { get; set; } = new HashSet<Book>();
    public override string ToString()
    {
        return UserName;
    }
}
