using EFModels.Enums;
using SPI.DTO;

namespace SPI.Services
{
    public interface IAuditService
    {
        List<AuditLogDto> GetAuditLogs();
        List<AuditLogDto> GetAuditLogs(string? logType = null, string? userName = null, DateTime? startDate = null, DateTime? endDate = null);
        void LogAudit(object original, object updated, LogType logType, string userName = "Guest");
    }
}