using Microsoft.AspNetCore.Mvc;
using WEA_BE.DTO;
using WEA_BE.Services;

namespace WEA_BE.Controllers;
[Route("user")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> _logger;
    private readonly IAuthService _authService;
    private readonly IUserService _userService;
    public UserController(ILogger<UserController> logger, IAuthService authService, IUserService userService)
    {
        _logger = logger;
        _authService = authService;
        _userService = userService;
    }
    [HttpPost("update")]
    public IActionResult Update([FromBody] UserDetailDto userDetailDto)
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
        bool result = _userService.UpdateUser(user.UserName, userDetailDto.Address, userDetailDto.BillingAddress, userDetailDto.ProcessData, userDetailDto.IsMale, userDetailDto.birthDay, userDetailDto.FavouriteGerners, userDetailDto.Referral, userDetailDto.Email);
        if (result)
        {
            return Ok("User updated");
        }
        return BadRequest("Unable to update user");
    }

    [HttpGet("detail")]
    public IActionResult GetDetail()
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

        UserDetailDto userDetailDto = _userService.GetUserDetail(user.UserName);
        return Ok(userDetailDto);
    }
}
