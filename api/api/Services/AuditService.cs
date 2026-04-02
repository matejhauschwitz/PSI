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
}
