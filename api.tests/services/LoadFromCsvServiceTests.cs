using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
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
    public class LoadFromCsvServiceTests : IDisposable
    {
        private readonly DatabaseContext _ctx;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IAuditService> _auditServiceMock;
        private readonly LoadFromCsvService _csvService;

        public LoadFromCsvServiceTests()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _ctx = new DatabaseContext(options);
            _mapperMock = new Mock<IMapper>();
            _auditServiceMock = new Mock<IAuditService>();

            _csvService = new LoadFromCsvService(
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

        [Fact]
        public async Task LoadFromCSV_ShouldLoadBooksToDatabase()
        {
            // Přidány povinné vlastnosti pro Book
            _ctx.Books.Add(
                new Book
                {
                    Id = 1,
                    ISBN13 = "9781234567890",
                    Title = "Existing Book",
                    Authors = "A",
                    CoverImageUrl = "A",
                    Description = "A",
                    Genre = "A",
                    ISBN10 = "A",
                    Subtitle = "A",
                }
            );
            await _ctx.SaveChangesAsync();

            var tempFilePath = Path.GetTempFileName();
            var csvContent =
                @"2,New Book,Autor,Žánr,1234567890,9780987654321,200,2024,,4.5,10,300,False
3,Old Title,Autor,Žánr,1111111111,9781234567890,100,2020,,3.0,5,200,False";

            await File.WriteAllTextAsync(tempFilePath, csvContent);

            _mapperMock
                .Setup(m => m.Map<List<BookDto>>(It.IsAny<IEnumerable<Book>>()))
                .Returns(new List<BookDto>());

            try
            {
                await _csvService.LoadFromCSV(tempFilePath);
                var allBooks = _ctx.Books.ToList();

                // Očekáváme 3 knihy (1 původní v DB + 2 z CSV)
                allBooks.Should().HaveCount(3);

                _auditServiceMock.Verify(
                    a =>
                        a.LogAudit(
                            It.IsAny<string>(),
                            It.IsAny<List<BookDto>>(),
                            LogType.LoadCsv,
                            "Guest"
                        ),
                    Times.Once
                );
            }
            finally
            {
                if (File.Exists(tempFilePath))
                {
                    File.Delete(tempFilePath);
                }
            }
        }
    }
}
