using AutoMapper;
using EFModels.Data;
using EFModels.Enums;
using EFModels.Models;
using System.Text.Json;
using SPI.DTO;

namespace SPI.Services;

public class AuditService : IAuditService
{
    private readonly DatabaseContext _ctx;
    private readonly IMapper _mapper;
    public AuditService(DatabaseContext ctx, IMapper mapper)
    {
        _ctx = ctx;
        _mapper = mapper;
    }

    public void LogAudit(object original, object updated, LogType logType, string userName = "Guest")
    {
        string originalJson = JsonSerializer.Serialize(original);
        string updatedJson = JsonSerializer.Serialize(updated);
        AuditLog auditLog = new AuditLog()
        {
            Original = originalJson,
            Updated = updatedJson,
            userName = userName,
            LogType = (int)logType,
            CreatedDate = DateTime.Now,
        };
        _ctx.AuditLogs.Add(auditLog);
        _ctx.SaveChanges();
    }

    public List<AuditLogDto> GetAuditLogs()
    {
        return _mapper.Map<List<AuditLogDto>>(_ctx.AuditLogs);
    }

    public List<AuditLogDto> GetAuditLogs(string? logType = null, string? userName = null, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _ctx.AuditLogs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(logType))
        {
            if (int.TryParse(logType, out int logTypeValue))
            {
                query = query.Where(x => x.LogType == logTypeValue);
            }
        }

        if (!string.IsNullOrWhiteSpace(userName))
        {
            query = query.Where(x => x.userName.ToLower().Contains(userName.ToLower()));
        }

        if (startDate.HasValue)
        {
            query = query.Where(x => x.CreatedDate >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(x => x.CreatedDate <= endDate.Value);
        }

        return _mapper.Map<List<AuditLogDto>>(query.ToList());
    }
}
