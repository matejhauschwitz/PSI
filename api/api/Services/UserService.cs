using AutoMapper;
using EFModels.Data;
using EFModels.Enums;
using EFModels.Models;
using Microsoft.EntityFrameworkCore;
using WEA_BE.DTO;

namespace WEA_BE.Services;

public class UserService : IUserService
{
    private readonly DatabaseContext _ctx;
    private readonly IMapper _mapper;
    private readonly IAuditService _auditService;
    public UserService(DatabaseContext ctx, IMapper mapper, IAuditService auditService)
    {
        _ctx = ctx;
        _mapper = mapper;
        _auditService = auditService;
    }
    public bool UpdateUser(string userName, AddressDto? address, AddressDto? billingAddress, bool? processData, bool? isMale, DateTime? birthDay, List<string> FavouriteGerners, string? referral, string? email)
    {
        var user = _ctx.Users.AsQueryable().Include(x => x.BillingAddress).Include(x => x.Address).SingleOrDefault(x => x.UserName == userName);
        if (user == null) return false;
        var oldUser = _mapper.Map<UserDetailDto>(user);
        user.Address = _mapper.Map<Address>(address);
        user.BillingAddress = _mapper.Map<Address>(billingAddress);
        user.ProcessData = processData;
        user.IsMale = isMale;
        if (birthDay is not null)
        {
            if (birthDay > DateTime.Today) return false;
        }
        user.BirthDay = birthDay;
        List<Genre> genres = new List<Genre>();
        foreach (var genre in FavouriteGerners)
        {

            Genre dbGenre = _ctx.Genres.SingleOrDefault(x => x.Name == genre);
            if (dbGenre is null)
            {
                dbGenre = new Genre()
                {
                    Name = genre
                };
            }
            genres.Add(dbGenre);
        }
        user.FavouriteGerners = genres;
        user.Referral = referral;
        user.Email = email;
        _ctx.SaveChanges();

        _auditService.LogAudit(oldUser, _mapper.Map<UserDetailDto>(user), LogType.UpdateUserDetail, user.UserName);

        return true;
    }

    public UserDetailDto? GetUserDetail(string userName)
    {
        var user = _ctx.Users.AsQueryable().Include(x => x.BillingAddress).Include(x => x.Address).Include(x => x.FavouriteGerners).SingleOrDefault(x => x.UserName == userName);
        if (user is null) return null;
        var dto = _mapper.Map<UserDetailDto>(user);
        return dto;
    }
}
