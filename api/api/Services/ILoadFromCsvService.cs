namespace SPI.Services;

public interface ILoadFromCsvService
{
    Task LoadFromCSV(string path);
}