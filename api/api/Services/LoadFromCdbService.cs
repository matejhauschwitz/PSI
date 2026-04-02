using AutoMapper;
using EFModels.Data;
using EFModels.Enums;
using EFModels.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using SPI.DTO;

namespace SPI.Services;

/// <summary>
/// Statická třída poskytující službu pro načítání dat knih z JSON řetězce.
/// </summary>
public class LoadFromCdbService
{
    private readonly DatabaseContext _ctx;
    private readonly IMapper _mapper;
    private readonly IAuditService _auditService;
    private readonly ILogger<LoadFromCdbService> _logger;
    public LoadFromCdbService(DatabaseContext ctx, IMapper mapper, IAuditService auditService, ILogger<LoadFromCdbService> logger)
    {
        _ctx = ctx;
        _mapper = mapper;
        _auditService = auditService;
        _logger = logger;
    }
    /// <summary>
    /// Načte data knih z řetězce ve formátu JSON a uloží je do databáze.
    /// </summary>
    /// <param name="ctx">Kontext databáze, který se používá k uložení dat.</param>
    /// <param name="json">Řetězec obsahující data ve formátu JSON, která reprezentují seznam objektů typu Book.</param>
    /// <returns>Asynchronní úloha, která indikuje, kdy bylo načtení a uložení dat dokončeno.</returns>
    /// <exception cref="JsonException">Vyvolá se, pokud dojde k chybě při deserializaci JSON řetězce.</exception>

    public async Task LoadFromString(List<CdbBookDto> data)
    {
        var books = _mapper.Map<List<Book>>(data);
        List<(Book book, string isbn)> group = _ctx.Books
                .Where(x => x.IsHidden == false)
                .Include(x => x.Comments)
                .Select(x => new { Book = x, ISBN = x.ISBN13 })
                .AsEnumerable()
                .Select(x => (x.Book, x.ISBN))
                .ToList();
        var isbnSet = new HashSet<string>(group.Select(x => x.isbn));
        foreach (var book in books)
        {
            try
            {
                if (isbnSet.Contains(book.ISBN13))
                {
                    var oldBook = group.Single(x => x.isbn == book.ISBN13 && x.book.IsHidden == false);
                    oldBook.book.IsHidden = true;
                    _auditService.LogAudit("", _mapper.Map<BookDto>(oldBook.book), LogType.HideBook, "cdb");
                    book.Comments = oldBook.book.Comments;
                }
                else
                {
                    _auditService.LogAudit("", _mapper.Map<BookDto>(book), LogType.LoadCdb, "cdb");
                }
                _ctx.Add((Book)book);
                _logger.LogInformation("Added book " + book.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError("Could not add book " + book.Id + ": " + ex.Message);
            }
        }
        await _ctx.SaveChangesAsync();

    }
}
