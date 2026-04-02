using EFModels.Enums;

namespace SPI.DTO;

public class OrderAddRequest
{
    public List<int> bookIds { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
}
