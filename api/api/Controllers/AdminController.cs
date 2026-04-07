using Microsoft.AspNetCore.Mvc;
using SPI.DTO;
using SPI.Services;
using EFModels.Enums;

namespace SPI.Controllers;

[Route("admin")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly ILogger<AdminController> _logger;
    private readonly IAuthService _authService;
    private readonly IUserService _userService;
    private readonly IOrderService _orderService;
    private readonly IBookService _bookService;
    private readonly IAuditService _auditService;

    public AdminController(
        ILogger<AdminController> logger,
        IAuthService authService,
        IUserService userService,
        IOrderService orderService,
        IBookService bookService,
        IAuditService auditService)
    {
        _logger = logger;
        _authService = authService;
        _userService = userService;
        _orderService = orderService;
        _bookService = bookService;
        _auditService = auditService;
    }

    /// <summary>
    /// Validates admin authorization from Bearer token.
    /// Returns Unauthorized() if token is missing, Forbid() if not admin.
    /// </summary>
    private async Task<IActionResult?> AuthorizeAdminAsync()
    {
        const string bearerScheme = "Bearer ";
        var authHeader = Request.Headers["Authorization"].ToString();

        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith(bearerScheme))
        {
            _logger.LogWarning("Admin access attempt with missing or invalid authorization header");
            return Unauthorized();
        }

        var token = authHeader[bearerScheme.Length..].Trim();
        var user = _authService.Authorize(token);

        if (user is null || user.Role != (int)UserRole.Admin)
        {
            _logger.LogWarning("Admin access attempt by unauthorized user");
            return Forbid();
        }

        return null; // Authorized
    }

    #region Users Management

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var authResult = await AuthorizeAdminAsync();
        if (authResult is not null) return authResult;

        try
        {
            var users = _userService.GetAllUsers();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return BadRequest("Unable to retrieve users");
        }
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] AdminCreateUserRequest request)
    {
        var authResult = await AuthorizeAdminAsync();
        if (authResult is not null) return authResult;

        try
        {
            bool success = _userService.CreateUser(request.UserName, request.Password, request.Name ?? request.UserName, request.Email);
            return success ? Ok("User created successfully") : BadRequest("Unable to create user");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return BadRequest("Unable to create user");
        }
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UserDetailDto userDto)
    {
        var authResult = await AuthorizeAdminAsync();
        if (authResult is not null) return authResult;

        try
        {
            bool success = _userService.UpdateUserById(
                id,
                userDto.Address, 
                userDto.BillingAddress, 
                userDto.ProcessData, 
                userDto.IsMale, 
                userDto.BirthDay, 
                userDto.FavouriteGerners, 
                userDto.Referral, 
                userDto.Email);
            
            return success ? Ok("User updated successfully") : BadRequest("Unable to update user");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user");
            return BadRequest("Unable to update user");
        }
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var authResult = await AuthorizeAdminAsync();
        if (authResult is not null) return authResult;

        try
        {
            bool success = _userService.DeleteUser(id);
            return success ? Ok("User deleted successfully") : BadRequest("Unable to delete user");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user");
            return BadRequest("Unable to delete user");
        }
    }

    #endregion

    #region Orders Management

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders()
    {
        var authResult = await AuthorizeAdminAsync();
        if (authResult is not null) return authResult;

        try
        {
            var orders = _orderService.GetAllOrders();
            return Ok(orders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving orders");
            return BadRequest("Unable to retrieve orders");
        }
    }

    [HttpPut("orders/{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatusUpdateDto request)
    {
        var authResult = await AuthorizeAdminAsync();
        if (authResult is not null) return authResult;

        try
        {
            bool success = _orderService.UpdateOrderStatus(id, request.Status);
            return success ? Ok("Order status updated successfully") : BadRequest("Unable to update order status");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating order status");
            return BadRequest("Unable to update order status");
        }
    }

    [HttpDelete("orders/{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var authResult = await AuthorizeAdminAsync();
        if (authResult is not null) return authResult;

        try
        {
            bool success = _orderService.DeleteOrder(id);
            return success ? Ok("Order deleted successfully") : BadRequest("Unable to delete order");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting order");
            return BadRequest("Unable to delete order");
        }
    }

    #endregion

    #region Books Management

    [HttpGet("books")]
    public async Task<IActionResult> GetBooks()
    {
        var authResult = await AuthorizeAdminAsync();
        if (authResult is not null) return authResult;

        try
        {
            var books = _bookService.GetAllBooks();
            return Ok(books);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving books");
            return BadRequest("Unable to retrieve books");
        }
    }

    [HttpPost("books")]
    public async Task<IActionResult> CreateBook([FromBody] BookDto bookDto)
    {
        var authResult = await AuthorizeAdminAsync();
        if (authResult is not null) return authResult;

        try
        {
            bool success = _bookService.CreateBook(bookDto);
            return success ? Ok("Book created successfully") : BadRequest("Unable to create book");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating book");
            return BadRequest("Unable to create book");
        }
    }

    [HttpPut("books/{id}")]
    public async Task<IActionResult> UpdateBook(int id, [FromBody] BookDto bookDto)
    {
        var authResult = await AuthorizeAdminAsync();
        if (authResult is not null) return authResult;

        try
        {
            bool success = _bookService.UpdateBook(id, bookDto);
            return success ? Ok("Book updated successfully") : BadRequest("Unable to update book");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating book");
            return BadRequest("Unable to update book");
        }
    }

    [HttpDelete("books/{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var authResult = await AuthorizeAdminAsync();
        if (authResult is not null) return authResult;

        try
        {
            bool success = _bookService.DeleteBook(id);
            return success ? Ok("Book deleted successfully") : BadRequest("Unable to delete book");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting book");
            return BadRequest("Unable to delete book");
        }
    }

    #endregion

    #region AuditLogs Management

    [HttpGet("auditlogs")]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] string? logType = null,
        [FromQuery] string? userName = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var authResult = await AuthorizeAdminAsync();
        if (authResult is not null) return authResult;

        try
        {
            var auditLogs = _auditService.GetAuditLogs(logType, userName, startDate, endDate);
            return Ok(auditLogs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs");
            return BadRequest("Unable to retrieve audit logs");
        }
    }

    #endregion
}
