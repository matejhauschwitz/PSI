using AutoMapper;
using EFModels.Data;
using EFModels.Enums;
using EFModels.Models;
using Microsoft.EntityFrameworkCore;
using SPI.DTO;

namespace SPI.Services;

public class CommentService : ICommentService
{
    private readonly DatabaseContext _ctx;
    private readonly IMapper _mapper;
    private readonly IAuditService _auditService;
    public CommentService(DatabaseContext ctx, IMapper mapper, IAuditService auditService)
    {
        _ctx = ctx;
        _mapper = mapper;
        _auditService = auditService;
    }

    public bool AddComment(int bookId, string content, string userName, double rating)
    {
        if (rating < 0 || rating > 5)
        {
            throw new ArgumentException("Rating must be between 0 and 5.");
        }

        var user = _ctx.Users.SingleOrDefault(user => user.UserName == userName);
        if (user == null)
        {
            return false;
        }

        var oldbook = _ctx.Books.AsQueryable().Include(x => x.Comments).SingleOrDefault(b => b.Id == bookId);

        var comment = new Comment()
        {
            Content = content,
            CreatedDate = DateTime.Now,
            BookId = bookId,
            UserId = user.Id,
            Rating = rating
        };
        _ctx.Comments.Add(comment);
        var book = _ctx.Books.AsQueryable().Include(x => x.Comments).SingleOrDefault(b => b.Id == bookId);
        if (rating > 0)
        {
            if (book is not null)
            {
                book.TotalRatings++;
                book.Rating = Math.Round((book.Rating * (book.TotalRatings - 1) + rating) / book.TotalRatings, 1);
            }
        }
        _ctx.SaveChanges();

        _auditService.LogAudit(_mapper.Map<List<CommentDto>>(oldbook.Comments), _mapper.Map<List<CommentDto>>(book.Comments), LogType.AddComment, user.UserName);

        return true;
    }

    public bool HasUserRating(int bookId, string userName)
    {
        var user = _ctx.Users.SingleOrDefault(u => u.UserName == userName);
        if (user == null) return false;

        return _ctx.Comments.Any(c => c.BookId == bookId && c.UserId == user.Id && c.Rating > 0);
    }

}
