using SPI.DTO;

namespace SPI.Services;

public interface IUserService
{
    UserDetailDto? GetUserDetail(string userName);
    bool UpdateUser(string userName, string name, AddressDto? address, AddressDto? billingAddress, bool? processData, bool? isMale, DateTime? birthDay, List<string> FavouriteGerners, string? referral, string? email, int role = 0);
    bool UpdateUserById(int id, string name, AddressDto? address, AddressDto? billingAddress, bool? processData, bool? isMale, DateTime? birthDay, List<string> FavouriteGerners, string? referral, string? email, int role = 0);
    int GetUserCount();
    List<UserDetailDto> GetAllUsers();
    bool DeleteUser(int userId);
    bool CreateUser(string userName, string password, string name, string? email, int role = 0);
}