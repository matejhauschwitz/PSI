using Microsoft.AspNetCore.Mvc;
using WEA_BE.DTO;
using WEA_BE.Services;

namespace WEA_BE.Controllers;

/// <summary>
/// API Controller pro autentizaci uživatelů (registraci a přihlášení).
/// </summary>
[Route("auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    /// <summary>
    /// Konstruktor pro AuthController.
    /// </summary>
    /// <param name="authService">Služba pro autentizaci uživatelů.</param>
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Endpoint pro registraci nového uživatele.
    /// </summary>
    /// <param name="registerRequestDto">DTO obsahující registrační údaje (jméno, uživatelské jméno, heslo).</param>
    /// <returns>Vrací zprávu o úspěšné registraci nebo chybový stav.</returns>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerRequestDto)
    {

        if (string.IsNullOrWhiteSpace(registerRequestDto.Name) || string.IsNullOrWhiteSpace(registerRequestDto.UserName))
        {
            return BadRequest("Name or Username cannot be empty or just whitespace.");
        }

        if (registerRequestDto.Password.Any(char.IsWhiteSpace))
        {
            return UnprocessableEntity("Password cannot contain whitespace characters.");
        }

        if (registerRequestDto.Password.Length < 8)
        {
            return UnprocessableEntity("Password must be at least 8 characters long.");
        }

        bool result = await _authService.RegisterAsync(registerRequestDto.Name, registerRequestDto.UserName, registerRequestDto.Password, registerRequestDto.Address, registerRequestDto.BillingAddress, registerRequestDto.ProcessData, registerRequestDto.IsMale, registerRequestDto.birthDay, registerRequestDto.FavouriteGerners, registerRequestDto.Referral, registerRequestDto.Email);
        if (result)
        {
            return StatusCode(201, "User registered successfully.");
        }

        return Conflict("User already exists.");
    }

    /// <summary>
    /// Endpoint pro přihlášení uživatele.
    /// </summary>
    /// <param name="loginRequestDto">DTO obsahující přihlašovací údaje (uživatelské jméno, heslo).</param>
    /// <returns>Vrací uživatelská data, pokud je přihlášení úspěšné, nebo chybový stav.</returns>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequestDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        string? result = await _authService.LoginAsync(loginRequestDto.UserName, loginRequestDto.Password);
        if (result is not null)
        {
            return Ok(result);
        }

        return Unauthorized("Invalid username or password.");
    }
}
