namespace WEA_BE.DTO;

public class UserDetailDto
{
    public AddressDto? Address { get; set; }
    public AddressDto? BillingAddress { get; set; }
    public bool? ProcessData { get; set; }
    public bool? IsMale { get; set; } = true; //Genesis 1:27
    public DateTime? birthDay { get; set; }
    public List<string> FavouriteGerners { get; set; }
    public string? Referral { get; set; }
    public string? Email { get; set; }
}
