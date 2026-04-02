using SPI.DTO;

namespace SPI.Services;

/// <summary>
/// Služba pro správu knih, zahrnující získávání knih na základě různých kritérií.
/// </summary>
public interface IBookService
{
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
    /// <param name="minPrice">Minimální cena pro filtrování</param>
    /// <param name="minPrice">Maximální cena pro filtrování</param>
    /// <returns>Seznam knih včetně celkového počtu záznamů.</returns>
    (List<BookSimpleDto>, int totalRecords) GetBooks(string? title, string? author, string? genre, int? publicationYear, double? minRating, double? maxRating, int page, int pageSize, double? minPrice, double? maxPrice);

    /// Vrací seznam oblíbených knih na základě zadaných filtrů a podporuje stránkování.
    /// </summary>
    /// <param name="title">Název knihy (nepovinné).</param>
    /// <param name="author">Autor knihy (nepovinné).</param>
    /// <param name="genre">Žánr knihy (nepovinné).</param>
    /// <param name="publicationYear">Rok vydání knihy (nepovinné).</param>
    /// <param name="minRating">Minimální hodnocení knihy (nepovinné).</param>
    /// <param="maxRating">Maximální hodnocení knihy (nepovinné).</param>
    /// <param name="minPrice">Minimální cena pro filtrování</param>
    /// <param name="minPrice">Maximální cena pro filtrování</param>
    /// <param name="page">Číslo stránky (výchozí hodnota 1).</param>
    /// <param name="pageSize">Počet položek na stránku (maximálně 100).</param>
    /// <returns>Seznam knih včetně celkového počtu záznamů.</returns>

    (List<BookSimpleDto>, int totalRecords) GetFavouriteBooks(string? title, string? author, string? genre, int? publicationYear, double? minRating, double? maxRating, double? minPrice, double? maxPrice, int page, int pageSize, string userName);

    bool SetFavourite(int bookId, string userName);


    /// <summary>
    /// Vrací konkrétní knihu na základě jejího ID.
    /// </summary>
    /// <param name="id">ID knihy.</param>
    /// <returns>DTO objekt knihy.</returns>
    BookDto GetBookById(int id);
    /// <summary>
    /// vrací list unikátních žánrů
    /// </summary>
    /// <returns>List unikátních žánrů.</returns>
    List<string> GetUniqueGenres();
    public bool RemoveFromFavourites(int bookId, string userName);
}
