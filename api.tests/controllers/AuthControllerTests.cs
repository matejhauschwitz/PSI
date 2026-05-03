using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using SPI.Controllers;
using SPI.DTO;
using SPI.Services;
using Xunit;

namespace api.tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _authServiceMock = new Mock<IAuthService>();
            _controller = new AuthController(_authServiceMock.Object);
        }

        private RegisterRequestDto CreateValidRegisterRequest()
        {
            return new RegisterRequestDto
            {
                Name = "Test User",
                UserName = "testuser",
                Password = "ValidPassword123!",
                Email = "test@test.com",
                ProcessData = true,
                IsMale = true,
                birthDay = new DateTime(2000, 1, 1),
                FavouriteGerners = new List<string> { "1", "2" }, // Změna na stringy
            };
        }

        #region Register Tests

        [Theory]
        [InlineData("", "validUsername")]
        [InlineData(" ", "validUsername")]
        [InlineData(null, "validUsername")]
        [InlineData("Valid Name", "")]
        [InlineData("Valid Name", " ")]
        [InlineData("Valid Name", null)]
        public async Task Register_WithEmptyNameOrUsername_ShouldReturnBadRequest(
            string name,
            string username
        )
        {
            // Arrange
            var request = CreateValidRegisterRequest();
            request.Name = name;
            request.UserName = username;

            // Act
            var result = await _controller.Register(request);

            // Assert
            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Name or Username cannot be empty or just whitespace.");
        }

        [Fact]
        public async Task Register_WithWhitespaceInPassword_ShouldReturnUnprocessableEntity()
        {
            // Arrange
            var request = CreateValidRegisterRequest();
            request.Password = "pass word 123";

            // Act
            var result = await _controller.Register(request);

            // Assert
            var unprocessable = result.Should().BeOfType<UnprocessableEntityObjectResult>().Subject;
            unprocessable.Value.Should().Be("Password cannot contain whitespace characters.");
        }

        [Fact]
        public async Task Register_WithShortPassword_ShouldReturnUnprocessableEntity()
        {
            // Arrange
            var request = CreateValidRegisterRequest();
            request.Password = "short1"; // 6 znaků

            // Act
            var result = await _controller.Register(request);

            // Assert
            var unprocessable = result.Should().BeOfType<UnprocessableEntityObjectResult>().Subject;
            unprocessable.Value.Should().Be("Password must be at least 8 characters long.");
        }

        [Fact]
        public async Task Register_WhenSuccessful_ShouldReturnCreated201()
        {
            // Arrange
            var request = CreateValidRegisterRequest();
            _authServiceMock
                .Setup(s =>
                    s.RegisterAsync(
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<AddressDto>(),
                        It.IsAny<AddressDto>(),
                        It.IsAny<bool>(),
                        It.IsAny<bool>(),
                        It.IsAny<DateTime>(),
                        It.IsAny<List<string>>(),
                        It.IsAny<string>(),
                        It.IsAny<string>()
                    )
                )
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Register(request);

            // Assert
            var objectResult = result.Should().BeOfType<ObjectResult>().Subject;
            objectResult.StatusCode.Should().Be(201);
            objectResult.Value.Should().Be("User registered successfully.");
        }

        [Fact]
        public async Task Register_WhenUserExists_ShouldReturnConflict()
        {
            // Arrange
            var request = CreateValidRegisterRequest();
            _authServiceMock
                .Setup(s =>
                    s.RegisterAsync(
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<AddressDto>(),
                        It.IsAny<AddressDto>(),
                        It.IsAny<bool>(),
                        It.IsAny<bool>(),
                        It.IsAny<DateTime>(),
                        It.IsAny<List<string>>(),
                        It.IsAny<string>(),
                        It.IsAny<string>()
                    )
                )
                .ReturnsAsync(false); // Vrací false = uživatel už existuje

            // Act
            var result = await _controller.Register(request);

            // Assert
            var conflictResult = result.Should().BeOfType<ConflictObjectResult>().Subject;
            conflictResult.Value.Should().Be("User already exists.");
        }

        #endregion

        #region Login Tests

        [Fact]
        public async Task Login_WithInvalidModelState_ShouldReturnBadRequest()
        {
            _controller.ModelState.AddModelError("UserName", "Required");
            // Doplněny povinné vlastnosti
            var request = new LoginRequestDto { UserName = "", Password = "" };

            var result = await _controller.Login(request);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task Login_WithValidCredentials_ShouldReturnOkWithToken()
        {
            // Arrange
            var request = new LoginRequestDto
            {
                UserName = "testuser",
                Password = "ValidPassword123!",
            };
            var expectedToken = "fake-jwt-token";

            _authServiceMock
                .Setup(s => s.LoginAsync(request.UserName, request.Password))
                .ReturnsAsync(expectedToken);

            // Act
            var result = await _controller.Login(request);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be(expectedToken);
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ShouldReturnUnauthorized()
        {
            // Arrange
            var request = new LoginRequestDto
            {
                UserName = "wronguser",
                Password = "wrongpassword",
            };

            _authServiceMock
                .Setup(s => s.LoginAsync(request.UserName, request.Password))
                .ReturnsAsync((string?)null); // Špatné jméno/heslo vrací null

            // Act
            var result = await _controller.Login(request);

            // Assert
            var unauthorized = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            unauthorized.Value.Should().Be("Invalid username or password.");
        }

        #endregion
    }
}
