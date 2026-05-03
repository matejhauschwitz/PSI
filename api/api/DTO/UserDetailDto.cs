using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;


namespace SPI.DTO;

[ExcludeFromCodeCoverage] // A tenhle atribut přímo nad třídu

public class UserDetailDto
{
    public int? Id { get; set; }
    public string? UserName { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    [JsonIgnore]
    public string? PasswordHash { get; set; }
    public AddressDto? Address { get; set; }
    public AddressDto? BillingAddress { get; set; }
    public bool? ProcessData { get; set; }
    public bool? IsMale { get; set; } = true; // Genesis 1:27
    public DateTime? BirthDay { get; set; }
    public List<string> FavouriteGerners { get; set; } = [];
    public string? Referral { get; set; }
    public int Role { get; set; }
}
