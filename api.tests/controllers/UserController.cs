using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SPI.Controllers;
using SPI.DTO;
using SPI.Services;
using Xunit;

namespace api.tests
{
    public class UserControllerTests
    {
        private readonly Mock<ILogger<UserController>> _mockLogger;
        private readonly Mock<IAuthService> _mockAuth;
        private readonly Mock<IUserService> _mockUser;
        private readonly UserController _controller;

        public UserControllerTests()
        {
            _mockLogger = new Mock<ILogger<UserController>>();
            _mockAuth = new Mock<IAuthService>();
            _mockUser = new Mock<IUserService>();

            _controller = new UserController(_mockLogger.Object, _mockAuth.Object, _mockUser.Object);
        }

        [Fact]
        public void GetUserCount_VraciOk_S_PoctemUzivatelu()
        {
            _mockUser.Setup(s => s.GetUserCount()).Returns(10);

            var result = _controller.GetUserCount();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public void GetDetail_VraciUnauthorized_KdyzChybiToken()
        {
            var httpContext = new DefaultHttpContext();
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = httpContext
            };

            var result = _controller.GetDetail();

            Assert.IsType<UnauthorizedObjectResult>(result);
        }
    }
}