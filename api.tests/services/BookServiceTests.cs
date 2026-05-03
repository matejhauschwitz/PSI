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
    public class BookServiceTests : IDisposable
    {
        private readonly DatabaseContext _ctx;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IAuditService> _auditServiceMock;
        private readonly BookService _bookService;

        public BookServiceTests()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _ctx = new DatabaseContext(options);
            _mapperMock = new Mock<IMapper>();
            _auditServiceMock = new Mock<IAuditService>();

            _bookService = new BookService(_ctx, _mapperMock.Object, _auditServiceMock.Object);
        }

        public void Dispose()
        {
            _ctx.Database.EnsureDeleted();
            _ctx.Dispose();
        }

        // Pomocná metoda pro vytvoření platné knihy
        private Book CreateValidBook(
            int id,
            string title,
            bool isHidden = false,
            string genre = "A",
            double price = 0
        )
        {
            return new Book
            {
                Id = id,
                Title = title,
                IsHidden = isHidden,
                Genre = genre,
                Price = price,
                Authors = "A",
                CoverImageUrl = "A",
                Description = "A",
                ISBN10 = "A",
                ISBN13 = "A",
                Subtitle = "A",
            };
        }

        // Pomocná metoda pro vytvoření uživatele
        private User CreateValidUser(string username)
        {
            return new User
            {
                UserName = username,
                Name = "Test",
                PasswordHash = "Hash",
            };
        }

        [Fact]
        public void GetBooks_WithNoFilters_ShouldReturnAllVisibleBooks()
        {
            _ctx.Books.Add(CreateValidBook(1, "Book 1"));
            _ctx.Books.Add(CreateValidBook(2, "Book 2"));
            _ctx.Books.Add(CreateValidBook(3, "Hidden", true));
            _ctx.SaveChanges();

            _mapperMock
                .Setup(m => m.Map<List<BookSimpleDto>>(It.IsAny<List<Book>>()))
                .Returns(new List<BookSimpleDto> { new BookSimpleDto(), new BookSimpleDto() });

            var (books, totalRecords) = _bookService.GetBooks(
                null,
                null,
                null,
                null,
                null,
                null,
                1,
                10,
                null,
                null
            );

            totalRecords.Should().Be(2);
            books.Should().HaveCount(2);
        }

        [Fact]
        public void GetBooks_WithVariousFilters_ShouldReturnCorrectBooks()
        {
            var b1 = CreateValidBook(1, "Harry Potter", false, "Fantasy", 300);
            b1.PublicationYear = 1997;
            b1.Rating = 4.5;
            b1.Authors = "Rowling";
            var b2 = CreateValidBook(2, "Lord of the Rings", false, "Fantasy, Adventure", 500);
            b2.PublicationYear = 1954;
            b2.Rating = 4.9;
            b2.Authors = "Tolkien";
            var b3 = CreateValidBook(3, "Dune", false, "Sci-Fi", 400);
            b3.PublicationYear = 1965;
            b3.Rating = 3.5;
            b3.Authors = "Herbert";

            _ctx.Books.AddRange(b1, b2, b3);
            _ctx.SaveChanges();

            _mapperMock
                .Setup(m => m.Map<List<BookSimpleDto>>(It.IsAny<List<Book>>()))
                .Returns(new List<BookSimpleDto> { new BookSimpleDto() });

            var (books, totalRecords) = _bookService.GetBooks(
                null,
                null,
                "Fantasy",
                null,
                4.8,
                null,
                1,
                10,
                null,
                null
            );

            totalRecords.Should().Be(1);
            _mapperMock.Verify(
                m => m.Map<List<BookSimpleDto>>(It.Is<List<Book>>(list => list.First().Id == 2)),
                Times.Once
            );
        }

        [Fact]
        public void GetBooks_WithPagination_ShouldReturnCorrectPage()
        {
            for (int i = 1; i <= 15; i++)
                _ctx.Books.Add(CreateValidBook(i, $"Book {i}"));
            _ctx.SaveChanges();

            _mapperMock
                .Setup(m => m.Map<List<BookSimpleDto>>(It.IsAny<List<Book>>()))
                .Returns(new List<BookSimpleDto>());

            var (books, totalRecords) = _bookService.GetBooks(
                null,
                null,
                null,
                null,
                null,
                null,
                2,
                5,
                null,
                null
            );

            totalRecords.Should().Be(15);
            _mapperMock.Verify(
                m =>
                    m.Map<List<BookSimpleDto>>(
                        It.Is<List<Book>>(list => list.Count == 5 && list.First().Id == 6)
                    ),
                Times.Once
            );
        }

        [Fact]
        public void GetUniqueGenres_ShouldReturnDistinctTrimmedGenres()
        {
            _ctx.Books.Add(CreateValidBook(1, "B1", false, "Fantasy, Sci-Fi"));
            _ctx.Books.Add(CreateValidBook(2, "B2", false, "Sci-fi, Action "));
            _ctx.Books.Add(CreateValidBook(3, "B3", false, "  Fantasy  "));
            _ctx.Books.Add(CreateValidBook(4, "B4", false, ""));
            _ctx.SaveChanges();

            var genres = _bookService.GetUniqueGenres();

            genres.Should().HaveCount(3);
            genres.Should().Contain(new[] { "Fantasy", "Sci-Fi", "Action" });
        }

        [Fact]
        public void SetFavourite_WhenUserNotFound_ShouldReturnFalse()
        {
            _ctx.Books.Add(CreateValidBook(1, "Test"));
            _ctx.SaveChanges();
            var result = _bookService.SetFavourite(1, "neexistujici_user");
            result.Should().BeFalse();
        }

        [Fact]
        public void SetFavourite_WithValidData_ShouldAddBookToUserFavourites()
        {
            var book = CreateValidBook(1, "Book 1");
            var user = CreateValidUser("test_user");
            user.FavouriteBooks = new List<Book>();
            _ctx.Books.Add(book);
            _ctx.Users.Add(user);
            _ctx.SaveChanges();

            _mapperMock.Setup(m => m.Map<BookDto>(It.IsAny<Book>())).Returns(new BookDto());

            var result = _bookService.SetFavourite(1, "test_user");
            result.Should().BeTrue();
        }

        [Fact]
        public void RemoveFromFavourites_WhenBookInFavourites_ShouldRemoveIt()
        {
            var book = CreateValidBook(1, "Book 1");
            var user = CreateValidUser("test_user");
            user.FavouriteBooks = new List<Book> { book };
            _ctx.Books.Add(book);
            _ctx.Users.Add(user);
            _ctx.SaveChanges();

            var result = _bookService.RemoveFromFavourites(1, "test_user");
            result.Should().BeTrue();
        }

        [Fact]
        public void GetFavouriteBooks_ShouldReturnOnlyUserFavouriteBooks()
        {
            var favBook = CreateValidBook(1, "Fav");
            var otherBook = CreateValidBook(2, "Other");
            var user = CreateValidUser("test_user");
            user.FavouriteBooks = new List<Book> { favBook };

            _ctx.Books.AddRange(favBook, otherBook);
            _ctx.Users.Add(user);
            _ctx.SaveChanges();

            _mapperMock
                .Setup(m => m.Map<List<BookSimpleDto>>(It.IsAny<List<Book>>()))
                .Returns(new List<BookSimpleDto> { new BookSimpleDto() });

            var (books, totalRecords) = _bookService.GetFavouriteBooks(
                "",
                "",
                "",
                null,
                null,
                null,
                null,
                null,
                1,
                10,
                "test_user"
            );

            totalRecords.Should().Be(1);
        }

        [Fact]
        public void GetBookById_ShouldReturnMappedBookWithComments()
        {
            var book = CreateValidBook(1, "Test");
            book.Comments = new List<Comment>
            {
                new Comment { Id = 1, Content = "Super" },
            };
            _ctx.Books.Add(book);
            _ctx.SaveChanges();

            var expectedDto = new BookDto { Title = "Test" };
            _mapperMock.Setup(m => m.Map<BookDto>(It.IsAny<Book>())).Returns(expectedDto);

            var result = _bookService.GetBookById(1);
            result.Should().Be(expectedDto);
        }

        [Fact]
        public void CreateBook_ShouldSaveToDatabase()
        {
            var bookDto = new BookDto { Title = "New Book" };
            // ZDE JE OPRAVA PRO FALSE CHYBU: Musíme vrátit plně validní knihu z mapperu
            _mapperMock.Setup(m => m.Map<Book>(bookDto)).Returns(CreateValidBook(0, "New Book"));

            var result = _bookService.CreateBook(bookDto);

            result.Should().BeTrue();
            _ctx.Books.Should().ContainSingle(b => b.Title == "New Book");
        }

        [Fact]
        public void UpdateBook_WhenBookExists_ShouldUpdateProperties()
        {
            _ctx.Books.Add(CreateValidBook(1, "Old Title"));
            _ctx.SaveChanges();

            var dto = new BookDto { Title = "New Title", Price = 999 };
            var result = _bookService.UpdateBook(1, dto);

            result.Should().BeTrue();
            _ctx.Books.Single(b => b.Id == 1).Title.Should().Be("New Title");
        }

        [Fact]
        public void DeleteBook_WhenBookExists_ShouldRemoveFromDatabase()
        {
            _ctx.Books.Add(CreateValidBook(1, "To Delete"));
            _ctx.SaveChanges();

            var result = _bookService.DeleteBook(1);

            result.Should().BeTrue();
            _ctx.Books.Should().BeEmpty();
        }
    }
}
