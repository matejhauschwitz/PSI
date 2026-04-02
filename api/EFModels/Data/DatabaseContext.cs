using EFModels.Models;
using Microsoft.EntityFrameworkCore;

namespace EFModels.Data;

public class DatabaseContext : DbContext
{
    public DatabaseContext(DbContextOptions options) : base(options) { }

    public DbSet<Book> Books { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Genre> Genres { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasMany(u => u.FavouriteBooks)
            .WithMany(b => b.Users)
            .UsingEntity(j => j.ToTable("UserFavouriteBooks")); // Optional: specify the join table name
        modelBuilder.Entity<Order>()
        .HasMany(o => o.Books)
        .WithMany(b => b.Orders);
    }
}
