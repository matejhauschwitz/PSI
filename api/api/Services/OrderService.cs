using AutoMapper;
using EFModels.Data;
using EFModels.Enums;
using EFModels.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using SPI.DTO;

namespace SPI.Services;

public class OrderService : IOrderService
{
    private readonly DatabaseContext _ctx;
    private readonly IMapper _mapper;
    private readonly IAuditService _auditService;
    public OrderService(DatabaseContext ctx, IMapper mapper, IAuditService auditService)
    {
        _ctx = ctx;
        _mapper = mapper;
        _auditService = auditService;
    }
    private bool CanUserOrder(User user)
    {
        if (user.Address is not null &&
               user.BillingAddress is not null &&
               user.ProcessData.HasValue &&
               user.IsMale.HasValue &&
               user.BirthDay.HasValue)
        {
            return (bool)user.ProcessData;
        }
        return false;
    }

    private double alterPayment(double totalPrice, PaymentMethod paymentMethod) =>
        paymentMethod switch
        {
            PaymentMethod.OnDelivery => totalPrice + 50,
            PaymentMethod.Transfer => totalPrice,
            PaymentMethod.OnlineCard => totalPrice * 1.01,
        };

    public int AddOrder(string username, List<int> bookIds, PaymentMethod paymentMethod)
    {
        var user = _ctx.Users.AsQueryable().Include(x => x.Address).Include(x => x.BillingAddress).SingleOrDefault(x => x.UserName == username);
        if (user is null) return -1;
        if (!CanUserOrder(user)) return -1;
        List<Book> books = new();
        foreach (int id in bookIds)
        {
            var book = _ctx.Books.SingleOrDefault(x => x.Id == id);
            if (book is not null && book.Price is not null && !book.IsHidden)
            {
                books.Add(book);
            }
        }
        double totalprice = books.Sum(x => (double)x.Price);
        totalprice = alterPayment(totalprice, paymentMethod);
        var order = new Order()
        {
            User = user,
            Books = books,
            Created = DateTime.Now,
            totalPrice = totalprice,
            PaymentMethod = paymentMethod,
            UserSnapshot = JsonSerializer.Serialize(user),
            Status = OrderStatus.Processing
        };
        _ctx.Orders.Add(order);
        _ctx.SaveChanges();


        _auditService.LogAudit("", _mapper.Map<OrderDto>(order), LogType.AddOrder, user.UserName);

        return order.Id;
    }

    public List<OrderDto> GetOrders(string username)
    {
        var user = _ctx.Users.SingleOrDefault(x => x.UserName == username);
        if (user is null) return null;
        List<Order> orders = _ctx.Orders
            .Where(x => x.User == user)
            .Include(x => x.Books)
            .Include(x => x.User)
            .ToList();
        var dtos = _mapper.Map<List<OrderDto>>(orders);
        return dtos;
    }
}
