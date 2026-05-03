using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using EFModels.Data;
using EFModels.Enums;
using EFModels.Models;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using SPI.DTO;
using SPI.Models;
using SPI.Services;
using Xunit;

namespace api.tests.Services
{
    public class AuthServiceTests : IDisposable
    {
        private readonly DatabaseContext _ctx;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IAuditService> _auditServiceMock;
        private readonly JwtSecretKey _secretKey;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _ctx = new DatabaseContext(options);
            _mapperMock = new Mock<IMapper>();
            _auditServiceMock = new Mock<IAuditService>();

            // JWT klíč musí mít alespoň 256 bitů (32 znaků), jinak to vyhodí chybu
            _secretKey = new JwtSecretKey
            {
                Key = "super_tajny_klic_pro_testovani_auth_service_1234567890!",
            };

            _authService = new AuthService(
                _ctx,
                _mapperMock.Object,
                _secretKey,
                _auditServiceMock.Object
            );
        }

        public void Dispose()
        {
            _ctx.Database.EnsureDeleted();
            _ctx.Dispose();
        }

        [Fact]
        public async Task RegisterAsync_WhenUserExists_ShouldReturnFalse()
        {
            // Arrange
            _ctx.Users.Add(
                new User
                {
                    UserName = "existujici_user",
                    Name = "Test",
                    PasswordHash = "Hash",
                }
            );
            await _ctx.SaveChangesAsync();

            // Act
            var result = await _authService.RegisterAsync(
                "Name",
                "existujici_user",
                "pass",
                null,
                null,
                null,
                null,
                null,
                new List<string>(),
                null,
                null
            );

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task RegisterAsync_WithValidData_ShouldCreateUserAndReturnTrue()
        {
            // Arrange
            var genres = new List<string> { "Sci-Fi" };

            // Mock mapperu pro audit
            _mapperMock.Setup(m => m.Map<UserDto>(It.IsAny<User>())).Returns(new UserDto());
            _mapperMock
                .Setup(m => m.Map<UserDetailDto>(It.IsAny<User>()))
                .Returns(new UserDetailDto());

            // Act
            var result = await _authService.RegisterAsync(
                "Jan",
                "novy_user",
                "heslo123",
                null,
                null,
                true,
                true,
                DateTime.Now,
                genres,
                null,
                "email@test.cz"
            );

            // Assert
            result.Should().BeTrue();
            var userInDb = _ctx
                .Users.Include(u => u.FavouriteGerners)
                .SingleOrDefault(u => u.UserName == "novy_user");

            userInDb.Should().NotBeNull();
            userInDb!.Name.Should().Be("Jan");
            userInDb.Email.Should().Be("email@test.cz");
            userInDb.FavouriteGerners.Should().HaveCount(1);
            userInDb.FavouriteGerners.First().Name.Should().Be("Sci-Fi");

            _auditServiceMock.Verify(
                a =>
                    a.LogAudit(
                        It.IsAny<string>(),
                        It.IsAny<object>(),
                        LogType.RegisterUser,
                        "novy_user"
                    ),
                Times.Once
            );
        }

        [Fact]
        public async Task LoginAsync_WhenUserDoesNotExist_ShouldReturnNull()
        {
            // Act
            var result = await _authService.LoginAsync("neexistuje", "pass");

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task LoginAsync_WhenPasswordIsIncorrect_ShouldReturnNull()
        {
            // Arrange - Založíme uživatele přes registraci, abychom měli reálný Hash a Salt
            await _authService.RegisterAsync(
                "Test",
                "login_user",
                "spravneHeslo",
                null,
                null,
                null,
                null,
                null,
                new List<string>(),
                null,
                null
            );

            // Act
            var result = await _authService.LoginAsync("login_user", "spatneHeslo");

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task LoginAsync_WhenCredentialsAreCorrect_ShouldReturnToken()
        {
            // Arrange
            await _authService.RegisterAsync(
                "Test",
                "login_user",
                "spravneHeslo",
                null,
                null,
                null,
                null,
                null,
                new List<string>(),
                null,
                null
            );

            // Act
            var token = await _authService.LoginAsync("login_user", "spravneHeslo");

            // Assert
            token.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public void Authorize_WithInvalidToken_ShouldReturnNull()
        {
            // Act
            var result = _authService.Authorize("neplatny.token.123");

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task Authorize_WithValidToken_ShouldReturnUserDto()
        {
            // Arrange
            await _authService.RegisterAsync(
                "Karel",
                "auth_user",
                "heslo",
                null,
                null,
                null,
                null,
                null,
                new List<string>(),
                null,
                null
            );
            var token = await _authService.LoginAsync("auth_user", "heslo");

            var expectedDto = new UserDto { UserName = "auth_user" };
            _mapperMock.Setup(m => m.Map<UserDto?>(It.IsAny<User>())).Returns(expectedDto);

            // Act
            var result = _authService.Authorize(token!);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEquivalentTo(expectedDto);
        }
    }
}
