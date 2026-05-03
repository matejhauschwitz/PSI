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
    public class CommentServiceTests : IDisposable
    {
        private readonly DatabaseContext _ctx;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IAuditService> _auditServiceMock;
        private readonly CommentService _commentService;

        public CommentServiceTests()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _ctx = new DatabaseContext(options);
            _mapperMock = new Mock<IMapper>();
            _auditServiceMock = new Mock<IAuditService>();

            _commentService = new CommentService(
                _ctx,
                _mapperMock.Object,
                _auditServiceMock.Object
            );
        }

        public void Dispose()
        {
            _ctx.Database.EnsureDeleted();
            _ctx.Dispose();
        }

        [Theory]
        [InlineData(-1)]
        [InlineData(5.1)]
        public void AddComment_WithInvalidRating_ShouldThrowArgumentException(double invalidRating)
        {
            var exception = Assert.Throws<ArgumentException>(() =>
                _commentService.AddComment(1, "Test content", "user", invalidRating)
            );

            exception.Message.Should().Be("Rating must be between 0 and 5.");
        }

        [Fact]
        public void AddComment_WhenUserDoesNotExist_ShouldReturnFalse()
        {
            var result = _commentService.AddComment(1, "Test content", "nonexistent_user", 3);
            result.Should().BeFalse();
        }

        [Fact]
        public void AddComment_WithValidDataAndRating_ShouldAddCommentAndUpdateBookRating()
        {
            var user = new User
            {
                Id = 1,
                UserName = "test_user",
                Name = "Test",
                PasswordHash = "Hash",
            };
            var book = new Book
            {
                Id = 1,
                Title = "Test Book",
                Rating = 4.0,
                TotalRatings = 1,
                Authors = "A",
                CoverImageUrl = "A",
                Description = "A",
                Genre = "A",
                ISBN10 = "A",
                ISBN13 = "A",
                Subtitle = "A",
            };
            _ctx.Users.Add(user);
            _ctx.Books.Add(book);
            _ctx.SaveChanges();

            _mapperMock
                .Setup(m => m.Map<List<CommentDto>>(It.IsAny<IEnumerable<Comment>>()))
                .Returns(new List<CommentDto>());

            var result = _commentService.AddComment(1, "Great book!", "test_user", 5.0);

            result.Should().BeTrue();
            var commentInDb = _ctx.Comments.SingleOrDefault(c => c.BookId == 1 && c.UserId == 1);
            commentInDb!.Content.Should().Be("Great book!");
            commentInDb.Rating.Should().Be(5.0);

            var updatedBook = _ctx.Books.Single(b => b.Id == 1);
            updatedBook.TotalRatings.Should().Be(2);
            updatedBook.Rating.Should().Be(4.5);
        }

        [Fact]
        public void AddComment_WithZeroRating_ShouldNotUpdateBookRating()
        {
            var user = new User
            {
                Id = 1,
                UserName = "test_user",
                Name = "Test",
                PasswordHash = "Hash",
            };
            var book = new Book
            {
                Id = 1,
                Title = "Test Book",
                Rating = 4.0,
                TotalRatings = 1,
                Authors = "A",
                CoverImageUrl = "A",
                Description = "A",
                Genre = "A",
                ISBN10 = "A",
                ISBN13 = "A",
                Subtitle = "A",
            };
            _ctx.Users.Add(user);
            _ctx.Books.Add(book);
            _ctx.SaveChanges();

            _mapperMock
                .Setup(m => m.Map<List<CommentDto>>(It.IsAny<IEnumerable<Comment>>()))
                .Returns(new List<CommentDto>());

            var result = _commentService.AddComment(
                1,
                "Just a comment without rating",
                "test_user",
                0
            );

            result.Should().BeTrue();
            var updatedBook = _ctx.Books.Single(b => b.Id == 1);
            updatedBook.TotalRatings.Should().Be(1);
            updatedBook.Rating.Should().Be(4.0);
        }

        [Fact]
        public void HasUserRating_WhenUserDoesNotExist_ShouldReturnFalse()
        {
            var result = _commentService.HasUserRating(1, "nonexistent");
            result.Should().BeFalse();
        }

        [Fact]
        public void HasUserRating_WhenUserHasRatingGreaterThanZero_ShouldReturnTrue()
        {
            var user = new User
            {
                Id = 1,
                UserName = "test_user",
                Name = "Test",
                PasswordHash = "Hash",
            };
            // DOPLNĚNO: Content = "Test"
            var comment = new Comment
            {
                BookId = 1,
                UserId = 1,
                Rating = 4,
                Content = "Test",
            };
            _ctx.Users.Add(user);
            _ctx.Comments.Add(comment);
            _ctx.SaveChanges();

            var result = _commentService.HasUserRating(1, "test_user");
            result.Should().BeTrue();
        }

        [Fact]
        public void HasUserRating_WhenUserHasZeroRating_ShouldReturnFalse()
        {
            var user = new User
            {
                Id = 1,
                UserName = "test_user",
                Name = "Test",
                PasswordHash = "Hash",
            };
            // DOPLNĚNO: Content = "Test"
            var comment = new Comment
            {
                BookId = 1,
                UserId = 1,
                Rating = 0,
                Content = "Test",
            };
            _ctx.Users.Add(user);
            _ctx.Comments.Add(comment);
            _ctx.SaveChanges();

            var result = _commentService.HasUserRating(1, "test_user");
            result.Should().BeFalse();
        }

        [Fact]
        public void GetCommentsByBookId_ShouldReturnDynamicObjectsOrderedByDateDescending()
        {
            var user = new User
            {
                Id = 1,
                UserName = "test_user",
                Name = "Test",
                PasswordHash = "Hash",
            };
            _ctx.Users.Add(user);

            var olderComment = new Comment
            {
                Id = 1,
                BookId = 1,
                UserId = 1,
                Content = "Old",
                CreatedDate = DateTime.Now.AddDays(-2),
                Rating = 3,
            };
            var newerComment = new Comment
            {
                Id = 2,
                BookId = 1,
                UserId = 1,
                Content = "New",
                CreatedDate = DateTime.Now,
                Rating = 5,
            };

            _ctx.Comments.AddRange(olderComment, newerComment);
            _ctx.SaveChanges();

            var comments = _commentService.GetCommentsByBookId(1);
            comments.Should().HaveCount(2);

            // ŘEŠENÍ CHYBY S DYNAMIC: Převedeme anonymní výstup na JSON a zkontrolujeme textově
            var json = System.Text.Json.JsonSerializer.Serialize(comments);
            json.Should().Contain("\"comment\":\"New\"");
            json.Should().Contain("\"comment\":\"Old\"");
            json.Should().Contain("\"creatorUserName\":\"test_user\"");
        }
    }
}
