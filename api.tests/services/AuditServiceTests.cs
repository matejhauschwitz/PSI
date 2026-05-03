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
    public class AuditServiceTests : IDisposable
    {
        private readonly DatabaseContext _ctx;
        private readonly Mock<IMapper> _mapperMock;
        private readonly AuditService _auditService;

        public AuditServiceTests()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _ctx = new DatabaseContext(options);
            _mapperMock = new Mock<IMapper>();
            _auditService = new AuditService(_ctx, _mapperMock.Object);
        }

        public void Dispose()
        {
            _ctx.Database.EnsureDeleted();
            _ctx.Dispose();
        }

        [Fact]
        public void LogAudit_WhenCalled_ShouldAddAuditLogToDatabase()
        {
            var original = new { Id = 1, Name = "Old" };
            var updated = new { Id = 1, Name = "New" };
            _auditService.LogAudit(original, updated, LogType.RegisterUser, "testuser");

            var log = _ctx.AuditLogs.SingleOrDefault();
            log.Should().NotBeNull();
            log!.userName.Should().Be("testuser");
            log.LogType.Should().Be((int)LogType.RegisterUser);
            log.Original.Should().Contain("Old");
            log.Updated.Should().Contain("New");
            log.CreatedDate.Should().BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(1));
        }

        [Fact]
        public void LogAudit_WhenUserNameNotProvided_ShouldUseGuest()
        {
            var obj = new { Id = 1 };
            _auditService.LogAudit(obj, obj, LogType.RegisterUser);

            var log = _ctx.AuditLogs.Single();
            log.userName.Should().Be("Guest");
        }

        [Fact]
        public void GetAuditLogs_ShouldReturnAllLogsMapped()
        {
            _ctx.AuditLogs.Add(
                new AuditLog
                {
                    Id = 1,
                    userName = "user1",
                    Original = "",
                    Updated = "",
                }
            );
            _ctx.AuditLogs.Add(
                new AuditLog
                {
                    Id = 2,
                    userName = "user2",
                    Original = "",
                    Updated = "",
                }
            );
            _ctx.SaveChanges();

            var expectedDto = new List<AuditLogDto> { new AuditLogDto(), new AuditLogDto() };
            _mapperMock
                .Setup(m => m.Map<List<AuditLogDto>>(It.IsAny<IEnumerable<AuditLog>>()))
                .Returns(expectedDto);

            var result = _auditService.GetAuditLogs();
            result.Should().BeEquivalentTo(expectedDto);
        }

        [Fact]
        public void GetAuditLogs_WithFilters_ShouldReturnFilteredLogs()
        {
            var baseDate = DateTime.Now.Date;
            _ctx.AuditLogs.Add(
                new AuditLog
                {
                    Id = 1,
                    userName = "Karel",
                    LogType = 1,
                    CreatedDate = baseDate.AddDays(-5),
                    Original = "",
                    Updated = "",
                }
            );
            _ctx.AuditLogs.Add(
                new AuditLog
                {
                    Id = 2,
                    userName = "Pavel",
                    LogType = 2,
                    CreatedDate = baseDate,
                    Original = "",
                    Updated = "",
                }
            );
            _ctx.AuditLogs.Add(
                new AuditLog
                {
                    Id = 3,
                    userName = "karel_novak",
                    LogType = 1,
                    CreatedDate = baseDate.AddDays(5),
                    Original = "",
                    Updated = "",
                }
            );
            _ctx.SaveChanges();

            var expectedDto = new List<AuditLogDto> { new AuditLogDto() };
            _mapperMock
                .Setup(m => m.Map<List<AuditLogDto>>(It.IsAny<IEnumerable<AuditLog>>()))
                .Returns(expectedDto);

            var result = _auditService.GetAuditLogs(
                logType: "1",
                userName: "KAREL",
                startDate: baseDate.AddDays(-1),
                endDate: null
            );

            _mapperMock.Verify(
                m =>
                    m.Map<List<AuditLogDto>>(
                        It.Is<IEnumerable<AuditLog>>(list =>
                            list.Count() == 1 && list.First().Id == 3
                        )
                    ),
                Times.Once
            );
            result.Should().BeEquivalentTo(expectedDto);
        }

        [Fact]
        public void GetAuditLogs_WithInvalidLogTypeFilter_ShouldIgnoreLogTypeFilter()
        {
            _ctx.AuditLogs.Add(
                new AuditLog
                {
                    Id = 1,
                    LogType = 1,
                    Original = "",
                    Updated = "",
                    userName = "user1",
                }
            );
            _ctx.AuditLogs.Add(
                new AuditLog
                {
                    Id = 2,
                    LogType = 2,
                    Original = "",
                    Updated = "",
                    userName = "user2",
                }
            );
            _ctx.SaveChanges();

            _mapperMock
                .Setup(m => m.Map<List<AuditLogDto>>(It.IsAny<IEnumerable<AuditLog>>()))
                .Returns(new List<AuditLogDto>());

            _auditService.GetAuditLogs(logType: "invalid");

            _mapperMock.Verify(
                m =>
                    m.Map<List<AuditLogDto>>(
                        It.Is<IEnumerable<AuditLog>>(list => list.Count() == 2)
                    ),
                Times.Once
            );
        }
    }
}
