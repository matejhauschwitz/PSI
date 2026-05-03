using AutoMapper;
using EFModels.Data;
using EFModels.Enums;
using EFModels.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using SPI.DTO;

namespace SPI.Services;

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

    private static string HashPassword(string password, byte[] salt)
    {
        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
        byte[] hash = pbkdf2.GetBytes(20);
        return Convert.ToBase64String(hash);
    }

    private static string CreatePasswordHash(string password)
    {
        byte[] salt = new byte[16];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }
        string hash = HashPassword(password, salt);
        return Convert.ToBase64String(salt) + ":" + hash;
    }

    public bool UpdateUser(string userName, string name, AddressDto? address, AddressDto? billingAddress, bool? processData, bool? isMale, DateTime? birthDay, List<string> FavouriteGerners, string? referral, string? email, int role = 0)
    {
        var user = _ctx.Users.AsQueryable()
            .Include(x => x.BillingAddress)
            .Include(x => x.Address)
            .SingleOrDefault(x => x.UserName == userName);
            
        if (user == null) return false;
        
        return ApplyUserUpdate(user, name, address, billingAddress, processData, isMale, birthDay, FavouriteGerners, referral, email, role);
    }

    public bool UpdateUserById(int id, string name, AddressDto? address, AddressDto? billingAddress, bool? processData, bool? isMale, DateTime? birthDay, List<string> FavouriteGerners, string? referral, string? email, int role = 0)
    {
        var user = _ctx.Users.AsQueryable().Include(x => x.BillingAddress).Include(x => x.Address).SingleOrDefault(x => x.Id == id);
        if (user == null) return false;

        return ApplyUserUpdate(user, name, address, billingAddress, processData, isMale, birthDay, FavouriteGerners, referral, email, role);
    }

    private bool ApplyUserUpdate(User user, string name, AddressDto? address, AddressDto? billingAddress, bool? processData, bool? isMale, DateTime? birthDay, List<string> FavouriteGerners, string? referral, string? email, int role = 0)
    {
        var oldUser = _mapper.Map<UserDetailDto>(user);
        
        user.Name = name;
        user.Role = (UserRole)role;
        
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
                dbGenre = new Genre() { Name = genre };
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

    public int GetUserCount()
    {
        return _ctx.Users.Count();
    }

    public List<UserDetailDto> GetAllUsers()
    {
        var users = _ctx.Users.Include(x => x.Address).Include(x => x.BillingAddress).Include(x => x.FavouriteGerners).ToList();
        return users.Select(u => _mapper.Map<UserDetailDto>(u)).ToList();
    }

    public bool DeleteUser(int userId)
    {
        var user = _ctx.Users.Find(userId);
        if (user is null) return false;
        
        try
        {
            _ctx.Users.Remove(user);
            _ctx.SaveChanges();
            return true;
        }
        catch (Exception ex)
        {
            return false;
        }
    }

    public bool CreateUser(string userName, string password, string name, string? email, int role = 0)
    {
        var existingUser = _ctx.Users.FirstOrDefault(x => x.UserName == userName);
        if (existingUser is not null) 
        {
            return false; 
        }

        var newUser = new User
        {
            UserName = userName,
            PasswordHash = CreatePasswordHash(password),
            Name = string.IsNullOrEmpty(name) ? userName : name,
            Email = email,
            Role = (UserRole)role
        };

        _ctx.Users.Add(newUser);
        
        _ctx.SaveChanges(); 
        
        return true;
    }
}
