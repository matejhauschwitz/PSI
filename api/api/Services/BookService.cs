using AutoMapper;
using EFModels.Data;
using EFModels.Enums;
using EFModels.Models;
using Microsoft.EntityFrameworkCore;
using SPI.DTO;

namespace SPI.Services;

/// <summary>
/// Služba pro správu knih, zahrnující získávání knih na základě různých kritérií.
/// </summary>
public class BookService : IBookService
{
    private readonly DatabaseContext _ctx;
    private readonly IMapper _mapper;
    private readonly IAuditService _auditService;

    /// <summary>
    /// Konstruktor pro inicializaci služby s kontextem databáze a mapováním objektů.
    /// </summary>
    /// <param name="ctx">Kontext databáze pro přístup k datům knih.</param>
    /// <param name="mapper">Automapper pro mapování mezi entitami a DTO.</param>
    public BookService(DatabaseContext ctx, IMapper mapper, IAuditService auditService)
    {
        _ctx = ctx;
        _mapper = mapper;
        _auditService = auditService;
    }

    /// Vrací seznam knih na základě zadaných filtrů a podporuje stránkování.
    /// </summary>
    /// <param name="title">Název knihy (nepovinné).</param>
    /// <param name="author">Autor knihy (nepovinné).</param>
    /// <param name="genre">Žánr knihy (nepovinné).</param>
    /// <param name="publicationYear">Rok vydání knihy (nepovinné).</param>
    /// <param name="minRating">Minimální hodnocení knihy (nepovinné).</param>
    /// <param="maxRating">Maximální hodnocení knihy (nepovinné).</param>
    /// <param name="page">Číslo stránky (výchozí hodnota 1).</param>
    /// <param name="pageSize">Počet položek na stránku (maximálně 100).</param>
    /// <returns>Seznam knih včetně celkového počtu záznamů.</returns>


    private List<Book> filter(IQueryable<Book> books, string? title, string? author, string? genre, int? publicationYear, double? minRating, double? maxRating, double? minPrice, double? maxPrice)
    {

        if (!string.IsNullOrWhiteSpace(title))
            books = books.Where(b => b.Title.ToLower().Contains(title.Trim().ToLower()));

        if (!string.IsNullOrWhiteSpace(author))
            books = books.Where(b => b.Authors.ToLower().Contains(author.Trim().ToLower()));

        if (!string.IsNullOrWhiteSpace(genre))
            books = books.Where(b => b.Genre.ToLower().Contains(genre.Trim().ToLower()));

        if (publicationYear is not null)
            books = books.Where(b => b.PublicationYear == publicationYear);

        if (minRating is not null)
            books = books.Where(b => b.Rating >= minRating);

        if (maxRating is not null)
            books = books.Where(b => b.Rating <= maxRating);

        if (minPrice.HasValue)
            books = books.Where(b => (double?)b.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            books = books.Where(b => (double?)b.Price <= maxPrice.Value);



        return books.ToList();
    }

    /// Vrací seznam oblíbených knih na základě zadaných filtrů a podporuje stránkování.
    /// </summary>
    /// <param name="title">Název knihy (nepovinné).</param>
    /// <param name="author">Autor knihy (nepovinné).</param>
    /// <param name="genre">Žánr knihy (nepovinné).</param>
    /// <param name="publicationYear">Rok vydání knihy (nepovinné).</param>
    /// <param name="minRating">Minimální hodnocení knihy (nepovinné).</param>
    /// <param="maxRating">Maximální hodnocení knihy (nepovinné).</param>
    /// <param name="page">Číslo stránky (výchozí hodnota 1).</param>
    /// <param name="pageSize">Počet položek na stránku (maximálně 100).</param>
    /// <returns>Seznam knih včetně celkového počtu záznamů.</returns>

    public (List<BookSimpleDto>, int totalRecords) GetBooks(string? title, string? author, string? genre, int? publicationYear, double? minRating, double? maxRating, int page, int pageSize, double? minPrice, double? maxPrice)
    {
        if (pageSize > 100) pageSize = 100;


        var allBooks = _ctx.Books.Where(x => x.IsHidden == false);
        var query = filter(allBooks, title, author, genre, publicationYear, minRating, maxRating, minPrice, maxPrice);

        var totalRecords = query.Count();

        var books = query.Skip((page - 1) * pageSize)
                         .Take(pageSize)
                         .ToList();

        var bookDtos = _mapper.Map<List<BookSimpleDto>>(books);
        return (bookDtos, totalRecords);
    }


    public bool SetFavourite(int bookId, string userName)
    {
        var book = _ctx.Books.SingleOrDefault(x => x.Id == bookId);
        if (book is null) return false;
        var user = _ctx.Users.Include(u => u.FavouriteBooks).SingleOrDefault(x => x.UserName == userName);
        if (user is null) return false;
        user.FavouriteBooks.Add(book);
        _ctx.SaveChanges();

        _auditService.LogAudit("", _mapper.Map<BookDto>(book), LogType.AddToFavourites, user.UserName);

        return true;
    }

    public (List<BookSimpleDto>, int totalRecords) GetFavouriteBooks(string? title, string? author, string? genre, int? publicationYear, double? minRating, double? maxRating, double? minPrice, double? maxPrice, int page, int pageSize, string userName)
    {
        if (pageSize > 100) pageSize = 100;

        var user = _ctx.Users
                      .Include(u => u.FavouriteBooks)
                      .SingleOrDefault(x => x.UserName == userName);

        var allBooks = _ctx.Books.Where(x => user.FavouriteBooks.Contains(x));

        var query = filter(allBooks, title, author, genre, publicationYear, minRating, maxRating, minPrice, maxPrice);

        var totalRecords = query.Count();

        var books = query.Skip((page - 1) * pageSize)
                         .Take(pageSize)
                         .ToList();

        var bookDtos = _mapper.Map<List<BookSimpleDto>>(books);
        return (bookDtos, totalRecords);
    }

    /// <summary>
    /// Vrací konkrétní knihu na základě jejího ID.
    /// </summary>
    /// <param name="id">ID knihy.</param>
    /// <returns>DTO objekt knihy.</returns>
    public BookDto GetBookById(int id)
    {
        var book = _ctx.Books.AsQueryable().Include(x => x.Comments).ThenInclude(x => x.User).SingleOrDefault(x => x.Id == id);
        var bookDtos = _mapper.Map<BookDto>(book);
        return bookDtos;
    }
    /// <summary>
    /// Vrací list unikátních žánrů z Databáze
    /// </summary>
    /// <returns>List unikátních žánrů</returns>
    public List<string> GetUniqueGenres()
    {
        return _ctx.Books
            .Select(b => b.Genre)
            .Where(g => !string.IsNullOrWhiteSpace(g))
            .AsEnumerable()
            .SelectMany(g => g.Split(',', StringSplitOptions.RemoveEmptyEntries))
            .Select(g => g.Trim())
            .Where(g => !string.IsNullOrWhiteSpace(g))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }
    public bool RemoveFromFavourites(int bookId, string userName)
    {
        var user = _ctx.Users.AsQueryable().Include(x => x.FavouriteBooks).SingleOrDefault(x => x.UserName == userName);
        if (user is null) return false;
        if (user.FavouriteBooks.Select(x => x.Id).Contains(bookId))
        {
            var book = user.FavouriteBooks.Single(x => x.Id == bookId);
            user.FavouriteBooks.Remove(book);
            _ctx.SaveChanges();

            _auditService.LogAudit("", _mapper.Map<BookDto>(book), LogType.RemoveFromFavourites, user.UserName);

            return true;
        }
        return false;
    }
}
