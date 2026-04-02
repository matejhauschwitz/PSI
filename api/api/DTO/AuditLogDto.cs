namespace SPI.DTO;

public class AuditLogDto
{
    public string Original { get; set; }
    public string Updated { get; set; }
    public DateTime CreatedDate { get; set; }
    public string userName { get; set; }
    public int LogType { get; set; }
}
