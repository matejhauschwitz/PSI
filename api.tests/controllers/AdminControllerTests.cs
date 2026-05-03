using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EFModels.Enums;
using EFModels.Models;
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
    public class AdminControllerTests
    {
        private readonly Mock<ILogger<AdminController>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly Mock<IUserService> _userServiceMock;
        private readonly Mock<IOrderService> _orderServiceMock;
        private readonly Mock<IBookService> _bookServiceMock;
        private readonly Mock<IAuditService> _auditServiceMock;
        private readonly AdminController _controller;

        public AdminControllerTests()
        {
            _loggerMock = new Mock<ILogger<AdminController>>();
            _authServiceMock = new Mock<IAuthService>();
            _userServiceMock = new Mock<IUserService>();
            _orderServiceMock = new Mock<IOrderService>();
            _bookServiceMock = new Mock<IBookService>();
            _auditServiceMock = new Mock<IAuditService>();

            _controller = new AdminController(
                _loggerMock.Object,
                _authServiceMock.Object,
                _userServiceMock.Object,
                _orderServiceMock.Object,
                _bookServiceMock.Object,
                _auditServiceMock.Object
            );

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext(),
            };
        }

        private void SetupAuthorizationHeader(string token = "valid_token")
        {
            _controller.Request.Headers["Authorization"] = $"Bearer {token}";
        }

        private void SetupValidAdmin()
        {
            SetupAuthorizationHeader();
            _authServiceMock
                .Setup(s => s.Authorize(It.IsAny<string>()))
                .Returns(new UserDto { UserName = "admin", Role = (int)UserRole.Admin });
        }

        #region Authorization Tests

        [Fact]
        public async Task AnyEndpoint_WithoutAuthHeader_ShouldReturnUnauthorized()
        {
            var result = await _controller.GetUsers();
            result.Should().BeOfType<UnauthorizedResult>();
        }

        [Fact]
        public async Task AnyEndpoint_WithInvalidUserOrRole_ShouldReturnForbid()
        {
            SetupAuthorizationHeader("invalid_or_user_token");
            _authServiceMock
                .Setup(s => s.Authorize(It.IsAny<string>()))
                .Returns(new UserDto { UserName = "user", Role = 999 });

            var result = await _controller.GetUsers();
            result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        #region Users Management Tests

        [Fact]
        public async Task GetUsers_WhenAuthorized_ShouldReturnOkWithUsers()
        {
            SetupValidAdmin();
            var expectedUsers = new List<UserDetailDto> { new UserDetailDto() };
            _userServiceMock.Setup(s => s.GetAllUsers()).Returns(expectedUsers);

            var result = await _controller.GetUsers();

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expectedUsers);
        }

        [Fact]
        public async Task GetUsers_WhenExceptionThrown_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _userServiceMock.Setup(s => s.GetAllUsers()).Throws(new Exception("DB Error"));

            var result = await _controller.GetUsers();

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to retrieve users");
        }

        [Fact]
        public async Task CreateUser_WhenSuccessful_ShouldReturnOk()
        {
            SetupValidAdmin();
            var request = new AdminCreateUserRequest { UserName = "test", Password = "pwd" };
            _userServiceMock
                .Setup(s =>
                    s.CreateUser(
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<string>()
                    )
                )
                .Returns(true);

            var result = await _controller.CreateUser(request);

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be("User created successfully");
        }

        [Fact]
        public async Task CreateUser_WhenFails_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _userServiceMock
                .Setup(s =>
                    s.CreateUser(
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<string>()
                    )
                )
                .Returns(false);

            var result = await _controller.CreateUser(
                new AdminCreateUserRequest { UserName = "test", Password = "password123" }
            );

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to create user");
        }

        [Fact]
        public async Task CreateUser_WhenExceptionThrown_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _userServiceMock
                .Setup(s =>
                    s.CreateUser(
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<string>()
                    )
                )
                .Throws(new Exception());

            var result = await _controller.CreateUser(
                new AdminCreateUserRequest { UserName = "test", Password = "password123" }
            );

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to create user");
        }

        [Fact]
        public async Task UpdateUser_WhenSuccessful_ShouldReturnOk()
        {
            SetupValidAdmin();
            _userServiceMock
                .Setup(s =>
                    s.UpdateUserById(
                        It.IsAny<int>(),
                        It.IsAny<AddressDto>(),
                        It.IsAny<AddressDto>(),
                        It.IsAny<bool?>(),
                        It.IsAny<bool?>(),
                        It.IsAny<DateTime?>(),
                        It.IsAny<List<string>>(),
                        It.IsAny<string>(),
                        It.IsAny<string>()
                    )
                )
                .Returns(true);

            var result = await _controller.UpdateUser(1, new UserDetailDto());

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be("User updated successfully");
        }

        [Fact]
        public async Task UpdateUser_WhenFails_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _userServiceMock
                .Setup(s =>
                    s.UpdateUserById(
                        It.IsAny<int>(),
                        It.IsAny<AddressDto>(),
                        It.IsAny<AddressDto>(),
                        It.IsAny<bool?>(),
                        It.IsAny<bool?>(),
                        It.IsAny<DateTime?>(),
                        It.IsAny<List<string>>(),
                        It.IsAny<string>(),
                        It.IsAny<string>()
                    )
                )
                .Returns(false);

            var result = await _controller.UpdateUser(1, new UserDetailDto());

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to update user");
        }

        [Fact]
        public async Task UpdateUser_WhenExceptionThrown_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _userServiceMock
                .Setup(s =>
                    s.UpdateUserById(
                        It.IsAny<int>(),
                        It.IsAny<AddressDto>(),
                        It.IsAny<AddressDto>(),
                        It.IsAny<bool?>(),
                        It.IsAny<bool?>(),
                        It.IsAny<DateTime?>(),
                        It.IsAny<List<string>>(),
                        It.IsAny<string>(),
                        It.IsAny<string>()
                    )
                )
                .Throws(new Exception());

            var result = await _controller.UpdateUser(1, new UserDetailDto());

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to update user");
        }

        [Fact]
        public async Task DeleteUser_WhenSuccessful_ShouldReturnOk()
        {
            SetupValidAdmin();
            _userServiceMock.Setup(s => s.DeleteUser(It.IsAny<int>())).Returns(true);

            var result = await _controller.DeleteUser(1);

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be("User deleted successfully");
        }

        [Fact]
        public async Task DeleteUser_WhenFails_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _userServiceMock.Setup(s => s.DeleteUser(It.IsAny<int>())).Returns(false);

            var result = await _controller.DeleteUser(1);

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to delete user");
        }

        [Fact]
        public async Task DeleteUser_WhenExceptionThrown_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _userServiceMock.Setup(s => s.DeleteUser(It.IsAny<int>())).Throws(new Exception());

            var result = await _controller.DeleteUser(1);

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to delete user");
        }

        #endregion

        #region Orders Management Tests

        [Fact]
        public async Task GetOrders_WhenAuthorized_ShouldReturnOk()
        {
            SetupValidAdmin();
            var expectedOrders = new List<OrderDto> { new OrderDto() };
            _orderServiceMock.Setup(s => s.GetAllOrders()).Returns(expectedOrders);

            var result = await _controller.GetOrders();

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expectedOrders);
        }

        [Fact]
        public async Task GetOrders_WhenExceptionThrown_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _orderServiceMock.Setup(s => s.GetAllOrders()).Throws(new Exception());

            var result = await _controller.GetOrders();

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to retrieve orders");
        }

        [Fact]
        public async Task UpdateOrderStatus_WhenSuccessful_ShouldReturnOk()
        {
            SetupValidAdmin();
            _orderServiceMock
                .Setup(s => s.UpdateOrderStatus(It.IsAny<int>(), It.IsAny<int>()))
                .Returns(true);

            var result = await _controller.UpdateOrderStatus(1, new OrderStatusUpdateDto());

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be("Order status updated successfully");
        }

        [Fact]
        public async Task UpdateOrderStatus_WhenFails_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _orderServiceMock
                .Setup(s => s.UpdateOrderStatus(It.IsAny<int>(), It.IsAny<int>()))
                .Returns(false);

            var result = await _controller.UpdateOrderStatus(1, new OrderStatusUpdateDto());

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to update order status");
        }

        [Fact]
        public async Task UpdateOrderStatus_WhenExceptionThrown_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _orderServiceMock
                .Setup(s => s.UpdateOrderStatus(It.IsAny<int>(), It.IsAny<int>()))
                .Throws(new Exception("DB Error"));

            var result = await _controller.UpdateOrderStatus(1, new OrderStatusUpdateDto());

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to update order status");
        }

        [Fact]
        public async Task DeleteOrder_WhenSuccessful_ShouldReturnOk()
        {
            SetupValidAdmin();
            _orderServiceMock.Setup(s => s.DeleteOrder(It.IsAny<int>())).Returns(true);

            var result = await _controller.DeleteOrder(1);

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be("Order deleted successfully");
        }

        [Fact]
        public async Task DeleteOrder_WhenFails_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _orderServiceMock.Setup(s => s.DeleteOrder(It.IsAny<int>())).Returns(false);

            var result = await _controller.DeleteOrder(1);

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to delete order");
        }

        [Fact]
        public async Task DeleteOrder_WhenExceptionThrown_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _orderServiceMock.Setup(s => s.DeleteOrder(It.IsAny<int>())).Throws(new Exception());

            var result = await _controller.DeleteOrder(1);

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to delete order");
        }

        #endregion

        #region Books Management Tests

        [Fact]
        public async Task GetBooks_WhenSuccessful_ShouldReturnOk()
        {
            SetupValidAdmin();
            var expectedBooks = new List<BookDto> { new BookDto() };
            _bookServiceMock.Setup(s => s.GetAllBooks()).Returns(expectedBooks);

            var result = await _controller.GetBooks();

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expectedBooks);
        }

        [Fact]
        public async Task GetBooks_WhenExceptionThrown_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _bookServiceMock.Setup(s => s.GetAllBooks()).Throws(new Exception());

            var result = await _controller.GetBooks();

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to retrieve books");
        }

        [Fact]
        public async Task CreateBook_WhenSuccessful_ShouldReturnOk()
        {
            SetupValidAdmin();
            _bookServiceMock.Setup(s => s.CreateBook(It.IsAny<BookDto>())).Returns(true);

            var result = await _controller.CreateBook(new BookDto());

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be("Book created successfully");
        }

        [Fact]
        public async Task CreateBook_WhenFails_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _bookServiceMock.Setup(s => s.CreateBook(It.IsAny<BookDto>())).Returns(false);

            var result = await _controller.CreateBook(new BookDto());

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to create book");
        }

        [Fact]
        public async Task CreateBook_WhenExceptionThrown_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _bookServiceMock.Setup(s => s.CreateBook(It.IsAny<BookDto>())).Throws(new Exception());

            var result = await _controller.CreateBook(new BookDto());

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to create book");
        }

        [Fact]
        public async Task UpdateBook_WhenSuccessful_ShouldReturnOk()
        {
            SetupValidAdmin();
            _bookServiceMock
                .Setup(s => s.UpdateBook(It.IsAny<int>(), It.IsAny<BookDto>()))
                .Returns(true);

            var result = await _controller.UpdateBook(1, new BookDto());

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be("Book updated successfully");
        }

        [Fact]
        public async Task UpdateBook_WhenFails_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _bookServiceMock
                .Setup(s => s.UpdateBook(It.IsAny<int>(), It.IsAny<BookDto>()))
                .Returns(false);

            var result = await _controller.UpdateBook(1, new BookDto());

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to update book");
        }

        [Fact]
        public async Task UpdateBook_WhenExceptionThrown_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _bookServiceMock
                .Setup(s => s.UpdateBook(It.IsAny<int>(), It.IsAny<BookDto>()))
                .Throws(new Exception());

            var result = await _controller.UpdateBook(1, new BookDto());

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to update book");
        }

        [Fact]
        public async Task DeleteBook_WhenSuccessful_ShouldReturnOk()
        {
            SetupValidAdmin();
            _bookServiceMock.Setup(s => s.DeleteBook(It.IsAny<int>())).Returns(true);

            var result = await _controller.DeleteBook(1);

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be("Book deleted successfully");
        }

        [Fact]
        public async Task DeleteBook_WhenFails_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _bookServiceMock.Setup(s => s.DeleteBook(It.IsAny<int>())).Returns(false);

            var result = await _controller.DeleteBook(1);

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to delete book");
        }

        [Fact]
        public async Task DeleteBook_WhenExceptionThrown_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _bookServiceMock.Setup(s => s.DeleteBook(It.IsAny<int>())).Throws(new Exception());

            var result = await _controller.DeleteBook(1);

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to delete book");
        }

        #endregion

        #region AuditLogs Management Tests

        [Fact]
        public async Task GetAuditLogs_WhenAuthorized_ShouldReturnOk()
        {
            SetupValidAdmin();
            var expectedLogs = new List<AuditLogDto> { new AuditLogDto() };
            _auditServiceMock
                .Setup(s =>
                    s.GetAuditLogs(
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<DateTime?>(),
                        It.IsAny<DateTime?>()
                    )
                )
                .Returns(expectedLogs);

            var result = await _controller.GetAuditLogs(null, null, null, null);

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expectedLogs);
        }

        [Fact]
        public async Task GetAuditLogs_WhenExceptionThrown_ShouldReturnBadRequest()
        {
            SetupValidAdmin();
            _auditServiceMock
                .Setup(s =>
                    s.GetAuditLogs(
                        It.IsAny<string>(),
                        It.IsAny<string>(),
                        It.IsAny<DateTime?>(),
                        It.IsAny<DateTime?>()
                    )
                )
                .Throws(new Exception());

            var result = await _controller.GetAuditLogs(null, null, null, null);

            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Unable to retrieve audit logs");
        }

        #endregion
    }
}
