using SPI.DTO;

namespace SPI.Services;

public interface ILoadFromCdbService
{
    Task LoadFromString(List<CdbBookDto> data);
}