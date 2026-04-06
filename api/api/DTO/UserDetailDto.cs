namespace SPI.DTO;

public class UserDetailDto
{
    public string? UserName { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? PasswordHash { get; set; }
    public AddressDto? Address { get; set; }
    public AddressDto? BillingAddress { get; set; }
    public bool? ProcessData { get; set; }
    public bool? IsMale { get; set; } = true; // Genesis 1:27
    public DateTime? BirthDay { get; set; }
    public List<string> FavouriteGerners { get; set; } = [];
    public string? Referral { get; set; }
    public int? Role { get; set; }
}
