namespace SPI.Services;

public interface ICommentService
{
    bool AddComment(int bookId, string content, string userName, double rating);

    public bool HasUserRating(int bookId, string userName);

    public List<dynamic> GetCommentsByBookId(int bookId);
}