using System;
using System.Collections.Generic;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SPI.Controllers;
using SPI.DTO; // nebo EFModels.Models podle toho, co vrací tvůj AuditService
using SPI.Services;
using Xunit;

namespace api.tests.Controllers
{
    public class AuditControllerTests
    {
        private readonly Mock<IAuditService> _auditServiceMock;
        private readonly Mock<ILogger<AuditController>> _loggerMock;
        private readonly AuditController _controller;

        public AuditControllerTests()
        {
            _auditServiceMock = new Mock<IAuditService>();
            _loggerMock = new Mock<ILogger<AuditController>>();

            _controller = new AuditController(_auditServiceMock.Object, _loggerMock.Object);
        }

        [Fact]
        public void GetAudits_ShouldReturnOkWithAuditLogs()
        {
            // Arrange
            // OPRAVA: Použijeme přesný typ, který si kompilátor vyžádal (AuditLogDto)
            var expectedLogs = new List<AuditLogDto> { new AuditLogDto() };
            _auditServiceMock.Setup(s => s.GetAuditLogs()).Returns(expectedLogs);

            // Act
            var result = _controller.GetAudits();

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expectedLogs);
        }

        [Fact]
        public void GetAudits_WhenServiceThrows_ShouldThrowException()
        {
            // Arrange
            // OPRAVA: Znovu správný název metody
            _auditServiceMock.Setup(s => s.GetAuditLogs()).Throws(new Exception("DB Error"));

            // Act & Assert
            // Protože controller nemá try-catch, kontrolujeme, že chyba probublá ven
            Action act = () => _controller.GetAudits();
            act.Should().Throw<Exception>().WithMessage("DB Error");
        }
    }
}
