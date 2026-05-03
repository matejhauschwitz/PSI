using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using EFModels.Data;
using EFModels.Enums;
using EFModels.Models;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using SPI.DTO;
using SPI.Services;
using Xunit;

namespace api.tests.Services
{
    public class UserServiceTests : IDisposable
    {
        private readonly DatabaseContext _ctx;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IAuditService> _auditServiceMock;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _ctx = new DatabaseContext(options);
            _mapperMock = new Mock<IMapper>();
            _auditServiceMock = new Mock<IAuditService>();

            _userService = new UserService(_ctx, _mapperMock.Object, _auditServiceMock.Object);
        }

        public void Dispose()
        {
            _ctx.Database.EnsureDeleted();
            _ctx.Dispose();
        }

        [Fact]
        public void CreateUser_WhenUserAlreadyExists_ShouldReturnFalse()
        {
            // Arrange
            _ctx.Users.Add(
                new User
                {
                    UserName = "existujici",
                    Name = "Test",
                    PasswordHash = "Hash",
                }
            );
            _ctx.SaveChanges();

            // Act
            var result = _userService.CreateUser("existujici", "heslo", "Jméno", "email@test.cz");

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void CreateUser_WithValidData_ShouldCreateUserWithHashedPassword()
        {
            // Act
            var result = _userService.CreateUser(
                "novy_user",
                "tajneHeslo",
                "Karel",
                "karel@test.cz"
            );

            // Assert
            result.Should().BeTrue();

            var userInDb = _ctx.Users.SingleOrDefault(u => u.UserName == "novy_user");
            userInDb.Should().NotBeNull();
            userInDb!.Name.Should().Be("Karel");
            userInDb.Role.Should().Be(UserRole.User);
            // Heslo musí být ve formátu salt:hash
            userInDb.PasswordHash.Should().Contain(":");
        }

        [Fact]
        public void UpdateUser_WithFutureBirthday_ShouldReturnFalse()
        {
            // Arrange
            _ctx.Users.Add(
                new User
                {
                    UserName = "test_user",
                    Name = "Test",
                    PasswordHash = "Hash",
                }
            );
            _ctx.SaveChanges();

            // Act - Narozeniny zítra
            var futureDate = DateTime.Today.AddDays(1);
            var result = _userService.UpdateUser(
                "test_user",           
                "Test",                
                null,                  
                null,                  
                null,                  
                null,                  
                futureDate,            
                new List<string>(),    
                null,                  
                null,                  
                0                      
            );

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void UpdateUser_WithValidData_ShouldUpdateFieldsAndMapGenres()
        {
            // Arrange
            _ctx.Users.Add(
                new User
                {
                    UserName = "test_user",
                    Name = "Test",
                    PasswordHash = "Hash",
                    FavouriteGerners = new List<Genre>(),
                }
            );
            _ctx.Genres.Add(new Genre { Name = "Sci-Fi" }); // Existující žánr
            _ctx.SaveChanges();

            _mapperMock
                .Setup(m => m.Map<UserDetailDto>(It.IsAny<User>()))
                .Returns(new UserDetailDto());

            // Act - Chceme přidat jeden existující žánr a jeden úplně nový
            var genresToUpdate = new List<string> { "Sci-Fi", "Fantasy" };
            var result = _userService.UpdateUser(
                "test_user",
                "Test",
                null,
                null,
                true,
                true,
                DateTime.Now.AddYears(-20),
                genresToUpdate,
                "referral_code",
                "email@test.cz",
                0
            );

            // Assert
            result.Should().BeTrue();

            var userInDb = _ctx
                .Users.Include(u => u.FavouriteGerners)
                .Single(u => u.UserName == "test_user");
            userInDb.ProcessData.Should().BeTrue();
            userInDb.IsMale.Should().BeTrue();
            userInDb.Referral.Should().Be("referral_code");

            // Žánry by měly být 2
            userInDb.FavouriteGerners.Should().HaveCount(2);
            userInDb
                .FavouriteGerners.Select(g => g.Name)
                .Should()
                .Contain(new[] { "Sci-Fi", "Fantasy" });

            // "Fantasy" by se mělo přidat do tabulky žánrů, protože tam nebylo
            _ctx.Genres.Should().ContainSingle(g => g.Name == "Fantasy");

            _auditServiceMock.Verify(
                a =>
                    a.LogAudit(
                        It.IsAny<UserDetailDto>(),
                        It.IsAny<UserDetailDto>(),
                        LogType.UpdateUserDetail,
                        "test_user"
                    ),
                Times.Once
            );
        }

        [Fact]
        public void GetUserCount_ShouldReturnCorrectNumber()
        {
            // Arrange
            _ctx.Users.Add(
                new User
                {
                    Id = 1,
                    UserName = "u1",
                    Name = "Test",
                    PasswordHash = "Hash",
                }
            );
            _ctx.Users.Add(
                new User
                {
                    Id = 2,
                    UserName = "u2",
                    Name = "Test",
                    PasswordHash = "Hash",
                }
            );
            _ctx.SaveChanges();

            // Act
            var count = _userService.GetUserCount();

            // Assert
            count.Should().Be(2);
        }

        [Fact]
        public void DeleteUser_WhenExists_ShouldRemoveAndReturnTrue()
        {
            // Arrange
            _ctx.Users.Add(
                new User
                {
                    Id = 1,
                    UserName = "u1",
                    Name = "Test",
                    PasswordHash = "Hash",
                }
            );
            _ctx.SaveChanges();

            // Act
            var result = _userService.DeleteUser(1);

            // Assert
            result.Should().BeTrue();
            _ctx.Users.Should().BeEmpty();
        }
    }
}
