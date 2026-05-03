using System.Collections.Generic;
using EFModels.Enums; // Předpoklad pro PaymentMethod, pokud existuje
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
    public class OrderControllerTests
    {
        private readonly Mock<IOrderService> _orderServiceMock;
        private readonly Mock<ILogger<CommentController>> _loggerMock; // Správně napodobuje ILogger<CommentController> z OrderController
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly OrderController _controller;

        public OrderControllerTests()
        {
            _orderServiceMock = new Mock<IOrderService>();
            _loggerMock = new Mock<ILogger<CommentController>>();
            _authServiceMock = new Mock<IAuthService>();

            _controller = new OrderController(
                _orderServiceMock.Object,
                _loggerMock.Object,
                _authServiceMock.Object
            );

            // Nastavení HttpContextu pro čtení hlaviček
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext(),
            };
        }

        private void SetupAuthorizationHeader(string token = "valid_token")
        {
            _controller.Request.Headers["Authorization"] = $"Bearer {token}";
        }

        #region Add Order Tests

        [Fact]
        public void Add_WithoutAuthHeader_ShouldReturnUnauthorized()
        {
            // Arrange
            var request = new OrderAddRequest
            {
                bookIds = new List<int> { 1, 2 },
            };

            // Act
            var result = _controller.Add(request);

            // Assert
            var unauthorized = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            unauthorized.Value.Should().Be("Authorization token is missing or invalid");
        }

        [Fact]
        public void Add_WithInvalidToken_ShouldReturnUnauthorized()
        {
            // Arrange
            SetupAuthorizationHeader("invalid_token");
            _authServiceMock.Setup(s => s.Authorize("invalid_token")).Returns((UserDto)null!);
            var request = new OrderAddRequest { bookIds = new List<int> { 1 } };

            // Act
            var result = _controller.Add(request);

            // Assert
            var unauthorized = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            unauthorized.Value.Should().Be("User is not authorized");
        }

        [Fact]
        public void Add_WhenSuccessful_ShouldReturnOkWithOrderId()
        {
            // Arrange
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);

            // Oprava: Přetypování (PaymentMethod) přímo u zakládání objektu
            var request = new OrderAddRequest
            {
                bookIds = new List<int> { 1, 2 },
                PaymentMethod = (PaymentMethod)1,
            };
            int expectedOrderId = 100; // Tuhle proměnnou jsi předtím ztratil

            // Explicitní přetypování PaymentMethod
            _orderServiceMock
                .Setup(s =>
                    s.AddOrder("testuser", request.bookIds, (PaymentMethod)request.PaymentMethod)
                )
                .Returns(expectedOrderId);

            // Act
            var result = _controller.Add(request);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be(expectedOrderId);
        }

        [Fact]
        public void Add_WhenFails_ShouldReturnBadRequest()
        {
            // Arrange
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);
            // Oprava: Přetypování (PaymentMethod) přímo u zakládání objektu
            var request = new OrderAddRequest
            {
                bookIds = new List<int> { 1, 2 },
                PaymentMethod = (PaymentMethod)1,
            };

            // Explicitní přetypování PaymentMethod
            _orderServiceMock
                .Setup(s =>
                    s.AddOrder("testuser", request.bookIds, (PaymentMethod)request.PaymentMethod)
                )
                .Returns(-1);

            // Act
            var result = _controller.Add(request);

            // Assert
            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to add order");
        }

        #endregion

        #region Get Orders Tests

        [Fact]
        public void GetOrders_WithoutAuthHeader_ShouldReturnUnauthorized()
        {
            // Arrange

            // Act
            var result = _controller.getOrders();

            // Assert
            var unauthorized = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            unauthorized.Value.Should().Be("Authorization token is missing or invalid");
        }

        [Fact]
        public void GetOrders_WithInvalidToken_ShouldReturnUnauthorized()
        {
            // Arrange
            SetupAuthorizationHeader("invalid_token");
            _authServiceMock.Setup(s => s.Authorize("invalid_token")).Returns((UserDto)null!);

            // Act
            var result = _controller.getOrders();

            // Assert
            var unauthorized = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            unauthorized.Value.Should().Be("User is not authorized");
        }

        [Fact]
        public void GetOrders_WhenSuccessful_ShouldReturnOkWithOrders()
        {
            // Arrange
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);

            var expectedOrders = new List<OrderDto> { new OrderDto() };
            _orderServiceMock.Setup(s => s.GetOrders("testuser")).Returns(expectedOrders);

            // Act
            var result = _controller.getOrders();

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expectedOrders);
        }

        [Fact]
        public void GetOrders_WhenServiceReturnsNull_ShouldReturnBadRequest()
        {
            // Arrange
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);

            _orderServiceMock.Setup(s => s.GetOrders("testuser")).Returns((List<OrderDto>)null!);

            // Act
            var result = _controller.getOrders();

            // Assert
            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to return orders");
        }

        #endregion
    }
}
