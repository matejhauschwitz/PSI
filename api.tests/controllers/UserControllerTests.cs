using System;
using System.Collections.Generic;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SPI.Controllers;
using SPI.DTO;
using SPI.Services;
using Xunit;

namespace api.tests.Controllers
{
    public class UserControllerTests
    {
        private readonly Mock<ILogger<UserController>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly Mock<IUserService> _userServiceMock;
        private readonly UserController _controller;

        public UserControllerTests()
        {
            _loggerMock = new Mock<ILogger<UserController>>();
            _authServiceMock = new Mock<IAuthService>();
            _userServiceMock = new Mock<IUserService>();

            _controller = new UserController(
                _loggerMock.Object,
                _authServiceMock.Object,
                _userServiceMock.Object
            );

            // Nastavení kontextu pro Headers
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext(),
            };
        }

        private void SetupAuthorizationHeader(string token = "valid_token")
        {
            _controller.Request.Headers["Authorization"] = $"Bearer {token}";
        }

        #region Update User Tests

        [Fact]
        public void Update_WithoutAuthHeader_ShouldReturnUnauthorized()
        {
            // Arrange (žádný header)
            var request = new UserDetailDto();

            // Act
            var result = _controller.Update(request);

            // Assert
            var unauthorized = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            unauthorized.Value.Should().Be("Authorization token is missing or invalid");
        }

        [Fact]
        public void Update_WithInvalidToken_ShouldReturnUnauthorized()
        {
            // Arrange
            SetupAuthorizationHeader("invalid_token");
            _authServiceMock.Setup(s => s.Authorize("invalid_token")).Returns((UserDto)null!);
            var request = new UserDetailDto();

            // Act
            var result = _controller.Update(request);

            // Assert
            var unauthorized = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            unauthorized.Value.Should().Be("User is not authorized");
        }

        [Fact]
        public void Update_WhenSuccessful_ShouldReturnOk()
        {
            // Arrange
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);

            var request = new UserDetailDto
            {
                ProcessData = true,
                IsMale = true,
                Email = "test@test.com",
                FavouriteGerners = new List<string> { "Action" }, // Změna na stringy
            };
            
            _userServiceMock
                .Setup(s =>
                    s.UpdateUser(
                        "testuser",
                        request.Name,
                        request.Address,
                        request.BillingAddress,
                        request.ProcessData,
                        request.IsMale,
                        request.BirthDay,
                        request.FavouriteGerners,
                        request.Referral,
                        request.Email,
                        request.Role
                    )
                )
                .Returns(true);

            // Act
            var result = _controller.Update(request);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be("User updated");
        }

        [Fact]
        public void Update_WhenFails_ShouldReturnBadRequest()
        {
            // Arrange
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);

            var request = new UserDetailDto();

            _userServiceMock
                .Setup(s =>
                    s.UpdateUser(
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<AddressDto>(),
                        It.IsAny<AddressDto>(),
                        It.IsAny<bool?>(),
                        It.IsAny<bool?>(),
                        It.IsAny<DateTime?>(),
                        It.IsAny<List<string>>(),
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<int>()
                    )
                )
                .Returns(false);

            // Act
            var result = _controller.Update(request);

            // Assert
            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to update user");
        }

        #endregion

        #region GetDetail Tests

        [Fact]
        public void GetDetail_WithoutAuthHeader_ShouldReturnUnauthorized()
        {
            // Arrange

            // Act
            var result = _controller.GetDetail();

            // Assert
            var unauthorized = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            unauthorized.Value.Should().Be("Authorization token is missing or invalid");
        }

        [Fact]
        public void GetDetail_WithInvalidToken_ShouldReturnUnauthorized()
        {
            // Arrange
            SetupAuthorizationHeader("invalid_token");
            _authServiceMock.Setup(s => s.Authorize("invalid_token")).Returns((UserDto)null!);

            // Act
            var result = _controller.GetDetail();

            // Assert
            var unauthorized = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            unauthorized.Value.Should().Be("User is not authorized");
        }

        [Fact]
        public void GetDetail_WhenSuccessful_ShouldReturnOkWithUserDetail()
        {
            // Arrange
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);

            var expectedDetail = new UserDetailDto { Email = "test@test.com" };
            _userServiceMock.Setup(s => s.GetUserDetail("testuser")).Returns(expectedDetail);

            // Act
            var result = _controller.GetDetail();

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expectedDetail);
        }

        #endregion

        #region GetUserCount Tests

        [Fact]
        public void GetUserCount_WhenSuccessful_ShouldReturnOkWithCount()
        {
            // Arrange
            int expectedCount = 42;
            _userServiceMock.Setup(s => s.GetUserCount()).Returns(expectedCount);

            // Act
            var result = _controller.GetUserCount();

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;

            var valueType = okResult.Value!.GetType(); // Přidán ! vykřičník
            var countProperty = valueType.GetProperty("count")!;
            var actualCount = (int)countProperty.GetValue(okResult.Value)!;

            actualCount.Should().Be(expectedCount);
        }

        [Fact]
        public void GetUserCount_WhenExceptionThrown_ShouldReturnBadRequest()
        {
            // Arrange
            _userServiceMock.Setup(s => s.GetUserCount()).Throws(new Exception("DB Error"));

            // Act
            var result = _controller.GetUserCount();

            // Assert
            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Could not retrieve user count");
        }

        #endregion
    }
}
