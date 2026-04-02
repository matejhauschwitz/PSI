using Microsoft.AspNetCore.Mvc;
using SPI.Services;

namespace SPI.Controllers;
[Route("audit")]
[ApiController]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;
    private readonly ILogger<AuditController> _logger;

    public AuditController(IAuditService auditService, ILogger<AuditController> logger)
    {
        _auditService = auditService;
        _logger = logger;
    }

    [HttpGet("audit")]
    public IActionResult GetAudits()
    {
        var auditLogs = _auditService.GetAuditLogs();
        return Ok(auditLogs);

    }
}
