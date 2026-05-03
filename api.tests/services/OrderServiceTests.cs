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
    public class OrderServiceTests : IDisposable
    {
        private readonly DatabaseContext _ctx;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<IAuditService> _auditServiceMock;
        private readonly OrderService _orderService;

        public OrderServiceTests()
        {
            var options = new DbContextOptionsBuilder<DatabaseContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _ctx = new DatabaseContext(options);
            _mapperMock = new Mock<IMapper>();
            _auditServiceMock = new Mock<IAuditService>();

            _orderService = new OrderService(_ctx, _mapperMock.Object, _auditServiceMock.Object);
        }

        public void Dispose()
        {
            _ctx.Database.EnsureDeleted();
            _ctx.Dispose();
        }

        [Fact]
        public void AddOrder_WhenUserDoesNotExist_ShouldReturnMinusOne()
        {
            // Act
            var result = _orderService.AddOrder(
                "neexistujici_user",
                new List<int> { 1 },
                PaymentMethod.Transfer
            );

            // Assert
            result.Should().Be(-1);
        }

        [Fact]
        public void AddOrder_WhenUserCannotOrder_ShouldReturnMinusOne()
        {
            // Arrange - Uživatel nemá vyplněnou adresu
            var user = new User
            {
                UserName = "incomplete_user",
                Name = "Test",
                PasswordHash = "Hash",
                Address = null,
            };
            _ctx.Users.Add(user);
            _ctx.SaveChanges();

            // Act
            var result = _orderService.AddOrder(
                "incomplete_user",
                new List<int> { 1 },
                PaymentMethod.Transfer
            );

            // Assert
            result.Should().Be(-1);
        }

        [Fact]
        public void AddOrder_WithValidData_ShouldCreateOrderWithCorrectPrice()
        {
            // Arrange
            var user = new User
            {
                UserName = "valid_user",
                Name = "Test",
                PasswordHash = "Hash", // TADY BYLA CHYBA (chybělo heslo)
                Address = new Address
                {
                    City = "A",
                    Country = "A",
                    StreetAddress = "A",
                    Zip = "A",
                },
                BillingAddress = new Address
                {
                    City = "A",
                    Country = "A",
                    StreetAddress = "A",
                    Zip = "A",
                },
                ProcessData = true,
                IsMale = true,
                BirthDay = DateTime.Now.AddYears(-20),
            };

            var book1 = new Book
            {
                Id = 1,
                Price = 100,
                IsHidden = false,
                Title = "B1",
                Authors = "A",
                CoverImageUrl = "A",
                Description = "A",
                Genre = "A",
                ISBN10 = "A",
                ISBN13 = "A",
                Subtitle = "A",
            };
            var book2 = new Book
            {
                Id = 2,
                Price = 200,
                IsHidden = false,
                Title = "B2",
                Authors = "A",
                CoverImageUrl = "A",
                Description = "A",
                Genre = "A",
                ISBN10 = "B",
                ISBN13 = "B",
                Subtitle = "A",
            };

            _ctx.Users.Add(user);
            _ctx.Books.AddRange(book1, book2);
            _ctx.SaveChanges();

            _mapperMock.Setup(m => m.Map<OrderDto>(It.IsAny<Order>())).Returns(new OrderDto());

            // Act
            var result = _orderService.AddOrder(
                "valid_user",
                new List<int> { 1, 2 },
                PaymentMethod.OnDelivery
            );

            // Assert
            result.Should().BeGreaterThan(0);

            var orderInDb = _ctx.Orders.Include(o => o.Books).Single();
            orderInDb.User.UserName.Should().Be("valid_user");
            orderInDb.Books.Should().HaveCount(2);
            orderInDb.totalPrice.Should().Be(350);

            _auditServiceMock.Verify(
                a =>
                    a.LogAudit(
                        It.IsAny<string>(),
                        It.IsAny<OrderDto>(),
                        LogType.AddOrder,
                        "valid_user"
                    ),
                Times.Once
            );
        }

        [Fact]
        public void UpdateOrderStatus_WithInvalidStatus_ShouldReturnFalse()
        {
            // Arrange
            _ctx.Orders.Add(
                new Order
                {
                    Id = 1,
                    Status = OrderStatus.Processing,
                    UserSnapshot = "",
                }
            );
            _ctx.SaveChanges();

            // Act - 999 neexistuje v OrderStatus enumu
            var result = _orderService.UpdateOrderStatus(1, 999);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void UpdateOrderStatus_WithValidStatus_ShouldUpdateAndReturnTrue()
        {
            // Arrange
            _ctx.Orders.Add(
                new Order
                {
                    Id = 1,
                    Status = OrderStatus.Processing,
                    UserSnapshot = "",
                }
            );
            _ctx.SaveChanges();

            // Act
            var result = _orderService.UpdateOrderStatus(1, (int)OrderStatus.Processing);

            // Assert
            result.Should().BeTrue();
            _ctx.Orders.Find(1)!.Status.Should().Be(OrderStatus.Processing);
        }

        [Fact]
        public void DeleteOrder_WhenOrderExists_ShouldRemoveFromDatabase()
        {
            // Arrange
            _ctx.Orders.Add(new Order { Id = 1, UserSnapshot = "" });
            _ctx.SaveChanges();

            // Act
            var result = _orderService.DeleteOrder(1);

            // Assert
            result.Should().BeTrue();
            _ctx.Orders.Should().BeEmpty();
        }
    }
}
