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
using Microsoft.Extensions.Logging;
using Moq;
using SPI.DTO;
using SPI.Services;
using Xunit;

namespace api.tests.Services
{
    public class LoadFromCdbServiceTests : IDisposable
    {
        private readonly DatabaseContext _ctx;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IAuditService> _auditServiceMock;
        private readonly Mock<ILogger<LoadFromCdbService>> _loggerMock;
        private readonly LoadFromCdbService _cdbService;

        public LoadFromCdbServiceTests()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _ctx = new DatabaseContext(options);
            _mapperMock = new Mock<IMapper>();
            _auditServiceMock = new Mock<IAuditService>();
            _loggerMock = new Mock<ILogger<LoadFromCdbService>>();

            _cdbService = new LoadFromCdbService(
                _ctx,
                _mapperMock.Object,
                _auditServiceMock.Object,
                _loggerMock.Object
            );
        }

        public void Dispose()
        {
            _ctx.Database.EnsureDeleted();
            _ctx.Dispose();
        }

        [Fact]
        public async Task LoadFromString_WithNewBooks_ShouldAddBooksToDatabase()
        {
            var inputDtos = new List<CdbBookDto> { new CdbBookDto(), new CdbBookDto() };
            var mappedBooks = new List<Book>
            {
                new Book
                {
                    Id = 1,
                    ISBN13 = "111",
                    Title = "New 1",
                    Authors = "A",
                    CoverImageUrl = "A",
                    Description = "A",
                    Genre = "A",
                    ISBN10 = "A",
                    Subtitle = "A",
                },
                new Book
                {
                    Id = 2,
                    ISBN13 = "222",
                    Title = "New 2",
                    Authors = "A",
                    CoverImageUrl = "A",
                    Description = "A",
                    Genre = "A",
                    ISBN10 = "A",
                    Subtitle = "A",
                },
            };

            _mapperMock.Setup(m => m.Map<List<Book>>(inputDtos)).Returns(mappedBooks);
            _mapperMock.Setup(m => m.Map<BookDto>(It.IsAny<Book>())).Returns(new BookDto());

            await _cdbService.LoadFromString(inputDtos);

            _ctx.Books.Should().HaveCount(2);
            _auditServiceMock.Verify(
                a => a.LogAudit(It.IsAny<string>(), It.IsAny<BookDto>(), LogType.LoadCdb, "cdb"),
                Times.Exactly(2)
            );
        }

        [Fact]
        public async Task LoadFromString_WithExistingISBN_ShouldHideOldBookAndAddNew()
        {
            var existingBook = new Book
            {
                Id = 1,
                ISBN13 = "123",
                Title = "Old Book",
                IsHidden = false,
                Authors = "A",
                CoverImageUrl = "A",
                Description = "A",
                Genre = "A",
                ISBN10 = "A",
                Subtitle = "A",
                Comments = new List<Comment>
                {
                    new Comment { Id = 1, Content = "C" },
                },
            };
            _ctx.Books.Add(existingBook);
            await _ctx.SaveChangesAsync();

            var inputDtos = new List<CdbBookDto> { new CdbBookDto() };
            var mappedBooks = new List<Book>
            {
                new Book
                {
                    Id = 2,
                    ISBN13 = "123",
                    Title = "New Book",
                    Authors = "A",
                    CoverImageUrl = "A",
                    Description = "A",
                    Genre = "A",
                    ISBN10 = "A",
                    Subtitle = "A",
                },
            };

            _mapperMock.Setup(m => m.Map<List<Book>>(inputDtos)).Returns(mappedBooks);
            _mapperMock.Setup(m => m.Map<BookDto>(It.IsAny<Book>())).Returns(new BookDto());

            await _cdbService.LoadFromString(inputDtos);

            var booksInDb = _ctx.Books.Include(b => b.Comments).ToList();
            booksInDb.Should().HaveCount(2);

            var oldBookInDb = booksInDb.Single(b => b.Id == 1);
            oldBookInDb.IsHidden.Should().BeTrue();

            var newBookInDb = booksInDb.Single(b => b.Id == 2);
            newBookInDb.IsHidden.Should().BeFalse();
            newBookInDb.Comments.Should().HaveCount(1);

            _auditServiceMock.Verify(
                a => a.LogAudit(It.IsAny<string>(), It.IsAny<BookDto>(), LogType.HideBook, "cdb"),
                Times.Once
            );
        }
    }
}
