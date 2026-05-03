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
    public class CommentControllerTests
    {
        private readonly Mock<ICommentService> _commentServiceMock;
        private readonly Mock<ILogger<CommentController>> _loggerMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly CommentController _controller;

        public CommentControllerTests()
        {
            _commentServiceMock = new Mock<ICommentService>();
            _loggerMock = new Mock<ILogger<CommentController>>();
            _authServiceMock = new Mock<IAuthService>();

            _controller = new CommentController(
                _commentServiceMock.Object,
                _loggerMock.Object,
                _authServiceMock.Object
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

        #region Add Comment Tests

        [Fact]
        public void Add_WithoutAuthHeader_ShouldReturnUnauthorized()
        {
            var request = new CommentRequestDto { bookId = 1, content = "Nice book" };
            var result = _controller.Add(request);
            var unauthorized = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            unauthorized.Value.Should().Be("Authorization token is missing or invalid");
        }

        [Fact]
        public void Add_WithInvalidToken_ShouldReturnUnauthorized()
        {
            SetupAuthorizationHeader("invalid_token");
            _authServiceMock.Setup(s => s.Authorize("invalid_token")).Returns((UserDto)null!);
            var request = new CommentRequestDto { bookId = 1, content = "Nice book" };
            var result = _controller.Add(request);
            var unauthorized = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            unauthorized.Value.Should().Be("User is not authorized");
        }

        [Fact]
        public void Add_WithRatingWhenUserAlreadyRated_ShouldReturnBadRequest()
        {
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);

            var request = new CommentRequestDto
            {
                bookId = 1,
                content = "Nice book",
                rating = 5,
            };

            _commentServiceMock.Setup(s => s.HasUserRating(1, "testuser")).Returns(true);
            var result = _controller.Add(request);
            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("User has already rated this book");
        }

        [Fact]
        public void Add_WhenSuccessful_ShouldReturnOk()
        {
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);

            var request = new CommentRequestDto
            {
                bookId = 1,
                content = "Nice book",
                rating = 5,
            };

            _commentServiceMock.Setup(s => s.HasUserRating(1, "testuser")).Returns(false);
            _commentServiceMock
                .Setup(s => s.AddComment(1, "Nice book", "testuser", 5))
                .Returns(true);

            var result = _controller.Add(request);
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be("Comment added");
        }

        [Fact]
        public void Add_WhenServiceFails_ShouldReturnBadRequest()
        {
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);

            var request = new CommentRequestDto
            {
                bookId = 1,
                content = "Nice book",
                rating = 0,
            };

            _commentServiceMock
                .Setup(s => s.AddComment(1, "Nice book", "testuser", 0))
                .Returns(false);

            var result = _controller.Add(request);
            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Comment could not be added");
        }

        #endregion

        #region Get Comments Tests

        [Fact]
        public void GetComments_WhenSuccessful_ShouldReturnOkWithComments()
        {
            // Arrange
            // OPRAVA: Vytváříme List<dynamic>, protože to je zřejmě to, co rozhraní ICommentService vyžaduje!
            var expectedComments = new List<dynamic> { new CommentDto() };
            _commentServiceMock.Setup(s => s.GetCommentsByBookId(1)).Returns(expectedComments);

            // Act
            var result = _controller.GetComments(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            // Kontrolujeme to jako List<dynamic>
            var actualData = Assert.IsType<List<dynamic>>(okResult.Value);

            Assert.Same(expectedComments, actualData);
        }

        [Fact]
        public void GetComments_WhenExceptionThrown_ShouldReturnBadRequest()
        {
            _commentServiceMock
                .Setup(s => s.GetCommentsByBookId(1))
                .Throws(new Exception("DB Error"));
            var result = _controller.GetComments(1);
            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Could not retrieve comments");
        }

        #endregion
    }
}
