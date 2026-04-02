using Microsoft.AspNetCore.Mvc;
using SPI.DTO;
using SPI.Services;

namespace SPI.Controllers;

/// <summary>
/// API Controller pro správu knih.
/// </summary>
[Route("books")]
[ApiController]
public class BooksController : ControllerBase
{
    private readonly ILogger<BooksController> _logger;
    private readonly IBookService _bookService;
    private readonly IAuthService _authService;

    /// <summary>
    /// Konstruktor pro BooksController.
    /// </summary>
    /// <param name="logger">Služba pro logování chyb a informací.</param>
    /// <param name="bookService">Služba pro správu knih.</param>
    public BooksController(ILogger<BooksController> logger, IBookService bookService, IAuthService authService)
    {
        _logger = logger;
        _bookService = bookService;
        _authService = authService;
    }

    /// <summary>
    /// Endpoint pro získání knih na základě různých filtrů.
    /// </summary>
    /// <param name="title">Název knihy pro filtrování.</param>
    /// <param name="author">Autor knihy pro filtrování.</param>
    /// <param name="genre">Žánr knihy pro filtrování.</param>
    /// <param name="publicationYear">Rok vydání knihy pro filtrování.</param>
    /// <param name="minRating">Minimální hodnocení pro filtrování.</param>
    /// <param name="maxRating">Maximální hodnocení pro filtrování.</param>
    /// <param name="minPrice">Minimální cena pro filtrování</param>
    /// <param name="minPrice">Maximální cena pro filtrování</param>
    /// <param name="page">Číslo stránky pro stránkování (výchozí hodnota je 1).</param>
    /// <param name="pageSize">Velikost stránky pro stránkování (výchozí hodnota je 10).</param>
    /// <returns>Vrací seznam knih s informacemi o stránkování.</returns>
    [HttpGet]
    [ProducesResponseType<BooksResponse>(StatusCodes.Status200OK)]
    public IActionResult Get(
        [FromQuery] string? title,
        [FromQuery] string? author,
        [FromQuery] string? genre,
        [FromQuery] int? publicationYear,
        [FromQuery] double? minRating,
        [FromQuery] double? maxRating,
        [FromQuery] double? minPrice,
        [FromQuery] double? maxPrice,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        _logger.LogInformation("Recieved request:");
        _logger.LogInformation(Request.ToString());
        (List<BookSimpleDto> books, int totalRecords) = _bookService.GetBooks(title, author, genre, publicationYear, minRating, maxRating, page, pageSize, minPrice, maxPrice);
        var response = new BooksResponse()
        {
            TotalRecords = totalRecords,
            TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize),
            Page = page,
            PageSize = pageSize,
            Books = books
        };

        return Ok(response);
    }

    /// <summary>
    /// Endpoint pro získání knihy podle jejího ID.
    /// </summary>
    /// <param name="id">ID knihy.</param>
    /// <returns>Vrací podrobnosti o knize nebo NotFound, pokud kniha neexistuje.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType<BookDto>(StatusCodes.Status200OK)]
    public IActionResult Get([FromRoute] int id)
    {
        BookDto book = _bookService.GetBookById(id);
        if (book == null)
            return NotFound();

        return Ok(book);
    }

    /// <summary>
    /// Endpoint pro získání unikátních žánrů
    /// </summary>
    /// <returns>List unikátních žánrů</returns>
    [HttpGet("genres")]
    public IActionResult GetGenres()
    {
        var genres = _bookService.GetUniqueGenres();
        return Ok(genres);
    }

    [HttpPost("favourites/{id}")]
    public IActionResult SetFavourite([FromRoute] int id)
    {
        _logger.LogInformation("Recieved request:");
        _logger.LogInformation(Request.ToString());

        var authorizationHeader = Request.Headers["Authorization"].ToString();

        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
        {
            _logger.LogWarning("Authorization header is missing or invalid");
            return Unauthorized("Authorization token is missing or invalid");
        }

        var token = authorizationHeader.Substring("Bearer ".Length).Trim();

        UserDto user = _authService.Authorize(token);
        if (user is null)
        {
            _logger.LogWarning("User name not found in JWT token");
            return Unauthorized("User is not authorized");
        }

        var result = _bookService.SetFavourite(id, user.UserName);
        if (result)
        {
            _logger.LogInformation("Book with ID: {BookId} was set as favourite by user '{UserName}'", id, user.UserName);
            return Ok("Book marked as favourite successfully");
        }

        _logger.LogWarning("Failed to set book with ID: {BookId} as favourite for user '{UserName}'", id, user.UserName);
        return BadRequest("Could not mark book as favourite");
    }

    [HttpGet("favourites")]
    public IActionResult GetFavourites(
        [FromQuery] string? title,
        [FromQuery] string? author,
        [FromQuery] string? genre,
        [FromQuery] int? publicationYear,
        [FromQuery] double? minRating,
        [FromQuery] double? maxRating,
        [FromQuery] double? minPrice,
        [FromQuery] double? maxPrice,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        _logger.LogInformation("Recieved request:");
        _logger.LogInformation(Request.ToString());

        var authorizationHeader = Request.Headers["Authorization"].ToString();

        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
        {
            _logger.LogWarning("Authorization header is missing or invalid");
            return Unauthorized("Authorization token is missing or invalid");
        }

        var token = authorizationHeader.Substring("Bearer ".Length).Trim();

        UserDto user = _authService.Authorize(token);
        if (user is null)
        {
            _logger.LogWarning("User name not found in JWT token");
            return Unauthorized("User is not authorized");
        }

        (List<BookSimpleDto> books, int totalRecords) = _bookService.GetFavouriteBooks(title, author, genre, publicationYear, minRating, maxRating, minPrice, maxPrice, page, pageSize, user.UserName);
        var response = new BooksResponse()
        {
            TotalRecords = totalRecords,
            TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize),
            Page = page,
            PageSize = pageSize,
            Books = books
        };

        return Ok(response);
    }

    [HttpDelete("favourites/{bookId}")]
    public IActionResult RemoveFromFavourites(int bookId)
    {
        var authorizationHeader = Request.Headers["Authorization"].ToString();

        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
        {
            _logger.LogWarning("Authorization header is missing or invalid");
            return Unauthorized("Authorization token is missing or invalid");
        }

        var token = authorizationHeader.Substring("Bearer ".Length).Trim();
        UserDto user = _authService.Authorize(token);

        if (user is null)
        {
            _logger.LogWarning("User name not found in JWT token");
            return Unauthorized("User is not authorized");
        }

        _logger.LogInformation("Received request to remove book {BookId} from favorites by user: {UserName}", bookId, user.UserName);

        bool result = _bookService.RemoveFromFavourites(bookId, user.UserName);

        if (result)
        {
            _logger.LogInformation("Book {BookId} successfully removed from {UserName}'s favourites", bookId, user.UserName);
            return Ok("Book removed from favourites");
        }

        _logger.LogWarning("Failed to remove book {BookId} from {UserName}'s favourites", bookId, user.UserName);
        return BadRequest("Failed to remove book from favourites");
    }

}
