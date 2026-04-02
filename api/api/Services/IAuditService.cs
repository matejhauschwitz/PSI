using EFModels.Enums;
using SPI.DTO;

namespace SPI.Services
{
    public interface IAuditService
    {
        List<AuditLogDto> GetAuditLogs();
        void LogAudit(object original, object updated, LogType logType, string userName = "Guest");
    }
}