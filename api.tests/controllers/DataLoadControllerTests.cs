using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EFModels.Data;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SPI.Controllers;
using SPI.DTO;
using SPI.Models;
using SPI.Services;
using Xunit;

namespace api.tests.Controllers
{
    public class DataLoadControllerTests
    {
        private readonly Mock<ILogger<DataLoadController>> _loggerMock;
        private readonly Mock<ILoadFromCsvService> _csvServiceMock;
        private readonly Mock<ILoadFromCdbService> _cdbServiceMock;
        private readonly FilePathOptions _options;
        private readonly DataLoadController _controller;

        public DataLoadControllerTests()
        {
            _loggerMock = new Mock<ILogger<DataLoadController>>();
            _csvServiceMock = new Mock<ILoadFromCsvService>(); // Teď už to projde!
            _cdbServiceMock = new Mock<ILoadFromCdbService>();

            _options = new FilePathOptions { CsvPath = "test/path/data.csv" };

            _controller = new DataLoadController(
                _loggerMock.Object,
                null!, // DatabaseContext je v konstruktoru controlleru, ale není nijak využit, null je bezpečný
                _options,
                _csvServiceMock.Object,
                _cdbServiceMock.Object
            );
        }

        #region LoadFromCsv Tests

        [Fact]
        public async Task LoadFromCsv_WhenSuccessful_ShouldReturnOk()
        {
            // Arrange
            _csvServiceMock
                .Setup(s => s.LoadFromCSV(_options.CsvPath))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.LoadFromCsv();

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be("Data loaded successfully from CSV file.");
        }

        [Fact]
        public async Task LoadFromCsv_WhenExceptionThrown_ShouldReturn500InternalServerError()
        {
            // Arrange
            _csvServiceMock
                .Setup(s => s.LoadFromCSV(It.IsAny<string>()))
                .ThrowsAsync(new Exception("CSV read error"));

            // Act
            var result = await _controller.LoadFromCsv();

            // Assert
            var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
            statusCodeResult.StatusCode.Should().Be(500);
            statusCodeResult.Value.Should().Be("Internal server error.");
        }

        #endregion

        #region LoadFromString Tests

        [Fact]
        public async Task LoadFromString_WhenDataIsEmpty_ShouldReturnBadRequest()
        {
            // Arrange
            var emptyData = new List<CdbBookDto>();

            // Act
            var result = await _controller.LoadFromString(emptyData);

            // Assert
            var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequest.Value.Should().Be("No data provided.");
        }

        [Fact]
        public async Task LoadFromString_WhenSuccessful_ShouldReturnOk()
        {
            // Arrange
            var data = new List<CdbBookDto> { new CdbBookDto() };
            _cdbServiceMock.Setup(s => s.LoadFromString(data)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.LoadFromString(data);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().Be("Data loaded successfully from string.");
        }

        [Fact]
        public async Task LoadFromString_WhenExceptionThrown_ShouldReturn500InternalServerError()
        {
            // Arrange
            var data = new List<CdbBookDto> { new CdbBookDto() };
            _cdbServiceMock
                .Setup(s => s.LoadFromString(It.IsAny<List<CdbBookDto>>()))
                .ThrowsAsync(new Exception("Parsing error"));

            // Act
            var result = await _controller.LoadFromString(data);

            // Assert
            var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
            statusCodeResult.StatusCode.Should().Be(500);
            statusCodeResult.Value.Should().Be("Internal server error.");
        }

        #endregion
    }
}
