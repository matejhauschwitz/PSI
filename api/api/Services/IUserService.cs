using WEA_BE.DTO;

namespace WEA_BE.Services;

public interface IUserService
{
    UserDetailDto? GetUserDetail(string userName);
    bool UpdateUser(string userName, AddressDto? address, AddressDto? billingAddress, bool? processData, bool? isMale, DateTime? birthDay, List<string> FavouriteGerners, string? referral, string? email);
}