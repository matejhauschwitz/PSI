using Microsoft.AspNetCore.Mvc;
using SPI.DTO;
using SPI.Services;

namespace SPI.Controllers;
[Route("order")]
[ApiController]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ILogger<CommentController> _logger;
    private readonly IAuthService _authService;

    public OrderController(IOrderService orderService, ILogger<CommentController> logger, IAuthService authService)
    {
        _orderService = orderService;
        _logger = logger;
        _authService = authService;
    }

    [HttpPost("order")]
    public IActionResult Add([FromBody] OrderAddRequest orderAddRequest)
    {
        var authorizationHeader = Request.Headers["Authorization"].ToString();

        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
        {
            _logger.LogWarning("Authorization header is missing or invalid");
            return Unauthorized("Authorization token is missing or invalid");
        }

        var token = authorizationHeader.Substring("Bearer ".Length).Trim();
        UserDto? user = _authService.Authorize(token);

        if (user is null)
        {
            _logger.LogWarning("User name not found in JWT token");
            return Unauthorized("User is not authorized");
        }
        var result = _orderService.AddOrder(user.UserName, orderAddRequest.bookIds, orderAddRequest.PaymentMethod);
        if (result != -1)
        {
            return Ok(result);
        }
        else return BadRequest("Unable to add order");
    }

    [HttpGet("orders")]
    public IActionResult getOrders()
    {
        var authorizationHeader = Request.Headers["Authorization"].ToString();

        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
        {
            _logger.LogWarning("Authorization header is missing or invalid");
            return Unauthorized("Authorization token is missing or invalid");
        }

        var token = authorizationHeader.Substring("Bearer ".Length).Trim();
        UserDto? user = _authService.Authorize(token);

        if (user is null)
        {
            _logger.LogWarning("User name not found in JWT token");
            return Unauthorized("User is not authorized");
        }
        var orders = _orderService.GetOrders(user.UserName);
        if (orders is null)
        {
            return BadRequest("Unable to return orders");
        }
        else return Ok(orders);
    }
}
