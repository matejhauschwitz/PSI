using System.ComponentModel.DataAnnotations;

namespace EFModels.Models;

public class AuditLog
{
    [Key]
    public int Id { get; set; }
    public string Original { get; set; }
    public string Updated { get; set; }
    public DateTime CreatedDate { get; set; }
    public string userName { get; set; }
    public int LogType { get; set; }
}
