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
    public class BooksControllerTests
    {
        private readonly Mock<ILogger<BooksController>> _loggerMock;
        private readonly Mock<IBookService> _bookServiceMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly BooksController _controller;

        public BooksControllerTests()
        {
            _loggerMock = new Mock<ILogger<BooksController>>();
            _bookServiceMock = new Mock<IBookService>();
            _authServiceMock = new Mock<IAuthService>();

            _controller = new BooksController(
                _loggerMock.Object,
                _bookServiceMock.Object,
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

        #region Get Books Tests

        [Fact]
        public void Get_ShouldReturnOkWithBooksResponse()
        {
            // Arrange
            var expectedBooks = new List<BookSimpleDto> { new BookSimpleDto() };
            var totalRecords = 15;

            _bookServiceMock
                .Setup(s =>
                    s.GetBooks(
                        It.IsAny<string?>(),
                        It.IsAny<string?>(),
                        It.IsAny<string?>(),
                        It.IsAny<int?>(),
                        It.IsAny<double?>(),
                        It.IsAny<double?>(),
                        1,
                        10,
                        It.IsAny<double?>(),
                        It.IsAny<double?>()
                    )
                )
                .Returns((expectedBooks, totalRecords));

            // Act
            var result = _controller.Get(null, null, null, null, null, null, null, null, 1, 10);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value.Should().BeOfType<BooksResponse>().Subject;

            response.TotalRecords.Should().Be(totalRecords);
            response.TotalPages.Should().Be(2); // 15 / 10 = 1.5 -> Ceiling = 2
            response.Page.Should().Be(1);
            response.PageSize.Should().Be(10);
            response.Books.Should().BeEquivalentTo(expectedBooks);
        }

        [Fact]
        public void GetById_WhenBookExists_ShouldReturnOk()
        {
            // Arrange
            var bookDto = new BookDto { Title = "Test Book" };
            _bookServiceMock.Setup(s => s.GetBookById(1)).Returns(bookDto);

            // Act
            var result = _controller.Get(1);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(bookDto);
        }

        [Fact]
        public void GetById_WhenBookNotFound_ShouldReturnNotFound()
        {
            // Arrange
            _bookServiceMock.Setup(s => s.GetBookById(999)).Returns((BookDto)null!);

            // Act
            var result = _controller.Get(999);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public void GetGenres_ShouldReturnOkWithGenresList()
        {
            // Arrange
            var genres = new List<string> { "Fantasy", "Sci-Fi" };
            _bookServiceMock.Setup(s => s.GetUniqueGenres()).Returns(genres);

            // Act
            var result = _controller.GetGenres();

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(genres);
        }

        #endregion

        #region Favourites Management Tests (SetFavourite, GetFavourites, RemoveFromFavourites)

        [Fact]
        public void SetFavourite_WithoutAuthHeader_ShouldReturnUnauthorized()
        {
            // Arrange (žádný header)

            // Act
            var result = _controller.SetFavourite(1);

            // Assert
            var unauthorized = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            unauthorized.Value.Should().Be("Authorization token is missing or invalid");
        }

        [Fact]
        public void SetFavourite_WithInvalidToken_ShouldReturnUnauthorized()
        {
            // Arrange
            SetupAuthorizationHeader("invalid_token");
            _authServiceMock.Setup(s => s.Authorize("invalid_token")).Returns((UserDto)null!);

            // Act
            var result = _controller.SetFavourite(1);

            // Assert
            var unauthorized = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            unauthorized.Value.Should().Be("User is not authorized");
        }

        [Fact]
        public void SetFavourite_WhenSuccessful_ShouldReturnOk()
        {
            // Arrange
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);
            _bookServiceMock.Setup(s => s.SetFavourite(1, "testuser")).Returns(true);

            // Act
            var result = _controller.SetFavourite(1);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be("Book marked as favourite successfully");
        }

        [Fact]
        public void SetFavourite_WhenFails_ShouldReturnBadRequest()
        {
            // Arrange
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);
            _bookServiceMock.Setup(s => s.SetFavourite(1, "testuser")).Returns(false);

            // Act
            var result = _controller.SetFavourite(1);

            // Assert
            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Could not mark book as favourite");
        }

        [Fact]
        public void GetFavourites_WhenAuthorized_ShouldReturnOkWithBooksResponse()
        {
            // Arrange
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);

            var expectedBooks = new List<BookSimpleDto> { new BookSimpleDto() };
            var totalRecords = 5;

            _bookServiceMock
                .Setup(s =>
                    s.GetFavouriteBooks(
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        1,
                        10,
                        "testuser"
                    )
                )
                .Returns((expectedBooks, totalRecords));

            // Act
            var result = _controller.GetFavourites(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                1,
                10
            );

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value.Should().BeOfType<BooksResponse>().Subject;

            response.TotalRecords.Should().Be(5);
            response.TotalPages.Should().Be(1);
            response.Books.Should().BeEquivalentTo(expectedBooks);
        }

        [Fact]
        public void RemoveFromFavourites_WhenSuccessful_ShouldReturnOk()
        {
            // Arrange
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);
            _bookServiceMock.Setup(s => s.RemoveFromFavourites(1, "testuser")).Returns(true);

            // Act
            var result = _controller.RemoveFromFavourites(1);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be("Book removed from favourites");
        }

        [Fact]
        public void RemoveFromFavourites_WhenFails_ShouldReturnBadRequest()
        {
            // Arrange
            SetupAuthorizationHeader("valid_token");
            var user = new UserDto { UserName = "testuser" };
            _authServiceMock.Setup(s => s.Authorize("valid_token")).Returns(user);
            _bookServiceMock.Setup(s => s.RemoveFromFavourites(1, "testuser")).Returns(false);

            // Act
            var result = _controller.RemoveFromFavourites(1);

            // Assert
            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("Failed to remove book from favourites");
        }

        #endregion
    }
}
