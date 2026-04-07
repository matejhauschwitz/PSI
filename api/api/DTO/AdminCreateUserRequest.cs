namespace SPI.DTO;

public class AdminCreateUserRequest
{
    public required string UserName { get; set; }
    public required string Password { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
}
