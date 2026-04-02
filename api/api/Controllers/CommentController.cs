using Microsoft.AspNetCore.Mvc;
using SPI.DTO;
using SPI.Services;

namespace SPI.Controllers;

[Route("comments")]
[ApiController]
public class CommentController : ControllerBase
{
    private readonly ICommentService _commentService;
    private readonly ILogger<CommentController> _logger;
    private readonly IAuthService _authService;

    public CommentController(ICommentService commentService, ILogger<CommentController> logger, IAuthService authService)
    {
        _commentService = commentService;
        _logger = logger;
        _authService = authService;
    }

    [HttpPost("comment")]
    public IActionResult Add([FromBody] CommentRequestDto commentRequest)
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

        _logger.LogInformation("Received request from user: {UserName}", user.UserName);
        _logger.LogInformation("Request details: {Request}", Request.ToString());

        if (commentRequest.rating > 0)
        {
            bool hasRated = _commentService.HasUserRating(commentRequest.bookId, user.UserName);
            if (hasRated)
            {
                _logger.LogWarning("User {UserName} has already rated book {BookId}", user.UserName, commentRequest.bookId);
                return BadRequest("User has already rated this book");
            }
        }
        bool result = _commentService.AddComment(commentRequest.bookId, commentRequest.content, user.UserName, commentRequest.rating);



        if (result)
        {
            _logger.LogInformation("Added comment");
            return Ok("Comment added");
        }

        _logger.LogInformation("Could not add comment");
        return BadRequest("Comment could not be added");
    }



}

