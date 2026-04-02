using EFModels.Data;
using Microsoft.AspNetCore.Mvc;
using SPI.DTO;
using SPI.Models;
using SPI.Services;

namespace SPI.Controllers;

/// <summary>
/// API Controller pro načítání dat do databáze z různých zdrojů (CSV, string).
/// </summary>
[Route("data")]
[ApiController]
public class DataLoadController : ControllerBase
{
    private readonly ILogger<DataLoadController> _logger;
    private readonly FilePathOptions _options;
    private readonly LoadFromCsvService _loadFromCsvService;
    private readonly LoadFromCdbService _loadFromStringService;

    /// <summary>
    /// Konstruktor pro DataLoadController.
    /// </summary>
    /// <param name="logger">Služba pro logování chyb a informací.</param>
    /// <param name="ctx">Databázový kontext pro manipulaci s daty.</param>
    /// <param name="options">Možnosti nastavení cesty k souborům.</param>
    public DataLoadController(ILogger<DataLoadController> logger, DatabaseContext ctx, FilePathOptions options, LoadFromCsvService loadFromCsvService, LoadFromCdbService loadFromStringService)
    {
        _logger = logger;
        _options = options;
        _loadFromCsvService = loadFromCsvService;
        _loadFromStringService = loadFromStringService;

    }

    /// <summary>
    /// Endpoint pro načtení dat z CSV souboru.
    /// </summary>
    /// <returns>Vrací zprávu o úspěšném načtení nebo chybový stav.</returns>
    [HttpPost("csv")]
    public async Task<IActionResult> LoadFromCsv()
    {
        try
        {
            await _loadFromCsvService.LoadFromCSV(_options.CsvPath);
            return Ok("Data loaded successfully from CSV file.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while loading data from CSV.");
            return StatusCode(500, "Internal server error.");
        }
    }

    /// <summary>
    /// Endpoint pro načtení dat ze stringu, který je poslán v těle žádosti.
    /// </summary>
    /// <param name="data">Řetězec obsahující data ve formátu JSON.</param>
    /// <returns>Vrací zprávu o úspěšném načtení nebo chybový stav.</returns>
    [HttpPost("cdb")]
    public async Task<IActionResult> LoadFromString([FromBody] List<CdbBookDto> data)
    {
        if (!data.Any())
        {
            return BadRequest("No data provided.");
        }

        try
        {
            await _loadFromStringService.LoadFromString(data);
            return Ok("Data loaded successfully from string.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while loading data from string.");
            return StatusCode(500, "Internal server error.");
        }
    }
}
