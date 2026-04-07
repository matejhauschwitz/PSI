using EFModels.Enums;
using SPI.DTO;

namespace SPI.Services
{
    public interface IOrderService
    {
        int AddOrder(string username, List<int> bookIds, PaymentMethod paymentMethod);
        List<OrderDto> GetOrders(string username);
        List<OrderDto> GetAllOrders();
        bool UpdateOrderStatus(int orderId, int status);
        bool DeleteOrder(int orderId);
    }
}