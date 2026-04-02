using EFModels.Enums;
using System.ComponentModel.DataAnnotations;

namespace EFModels.Models;

public class Order
{
    [Key]
    public int Id { get; set; }
    public List<Book> Books { get; set; }
    public DateTime Created { get; set; }
    public User User { get; set; }
    public string UserSnapshot { get; set; }
    public double totalPrice { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
    public OrderStatus? Status { get; set; }
}
