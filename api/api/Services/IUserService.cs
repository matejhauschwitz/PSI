using SPI.DTO;

namespace SPI.Services;

public interface IUserService
{
    UserDetailDto? GetUserDetail(string userName);
    bool UpdateUser(string userName, AddressDto? address, AddressDto? billingAddress, bool? processData, bool? isMale, DateTime? birthDay, List<string> FavouriteGerners, string? referral, string? email);
    bool UpdateUserById(int id, AddressDto? address, AddressDto? billingAddress, bool? processData, bool? isMale, DateTime? birthDay, List<string> FavouriteGerners, string? referral, string? email);
    int GetUserCount();
    List<UserDetailDto> GetAllUsers();
    bool DeleteUser(int userId);
    bool CreateUser(string userName, string password, string name, string? email);
}