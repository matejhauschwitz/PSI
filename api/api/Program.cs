using System.Diagnostics.CodeAnalysis;
using DotNetEnv;
using EFModels.Data;
using EFModels.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;
using SPI.DTO;
using SPI.Models;
using SPI.Services;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration().WriteTo.Console().CreateLogger();

if (builder.Environment.IsDevelopment())
{
    Env.Load(".env");
}

var jwtSecretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");

builder.Host.UseSerilog(
    (context, loggerConfiguration) =>
    {
        loggerConfiguration.WriteTo.Console();
        loggerConfiguration.ReadFrom.Configuration(context.Configuration);
    }
);
builder.Services.AddDbContext<DatabaseContext>(options =>
{
    try
    {
        var connectionString = builder.Configuration.GetConnectionString("Default");
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 21));
        options.UseMySql(
            connectionString,
            serverVersion,
            o =>
            {
                o.EnableRetryOnFailure(10, TimeSpan.FromSeconds(30), null);
            }
        );
    }
    catch (Exception ex)
    {
        Console.WriteLine($"CHYBA PRI KONFIGURACI DB: {ex.Message}");
    }
});

var SPICors = "_SPICors";

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        SPICors,
        policy =>
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
    );
});

builder.Services.AddAutoMapper(cfg =>
{
    cfg.CreateMap<CdbBookDto, Book>()
        .ForMember(dest => dest.Genre, opt => opt.MapFrom(src => src.Categories))
        .ForMember(dest => dest.CoverImageUrl, opt => opt.MapFrom(src => src.Thumbnail))
        .ForMember(dest => dest.PublicationYear, opt => opt.MapFrom(src => src.published_year))
        .ForMember(dest => dest.Rating, opt => opt.MapFrom(src => src.average_rating))
        .ForMember(dest => dest.PageCount, opt => opt.MapFrom(src => src.num_pages))
        .ForMember(dest => dest.TotalRatings, opt => opt.MapFrom(src => src.ratings_count))
        .ForMember(dest => dest.Comments, opt => opt.Ignore())
        .ForMember(dest => dest.Users, opt => opt.Ignore())
        .ForMember(dest => dest.IsHidden, opt => opt.Ignore())
        .ForMember(dest => dest.Genres, opt => opt.Ignore())
        .ForMember(dest => dest.Id, opt => opt.Ignore());

    cfg.CreateMap<Book, BookDto>()
        .ForMember(
            dest => dest.CoverImageUrl,
            opt =>
                opt.MapFrom(src =>
                    !string.IsNullOrEmpty(src.ISBN13)
                        ? $"https://covers.openlibrary.org/b/isbn/{src.ISBN13}-L.jpg"
                        : $"https://covers.openlibrary.org/b/isbn/{src.ISBN10}-L.jpg"
                )
        )
        .ReverseMap();

    cfg.CreateMap<Book, BookSimpleDto>()
        .ForMember(
            dest => dest.CoverImageUrl,
            opt =>
                opt.MapFrom(src =>
                    !string.IsNullOrEmpty(src.ISBN13)
                        ? $"https://covers.openlibrary.org/b/isbn/{src.ISBN13}-L.jpg"
                        : $"https://covers.openlibrary.org/b/isbn/{src.ISBN10}-L.jpg"
                )
        )
        .ReverseMap();

    cfg.CreateMap<AuditLog, AuditLogDto>().ReverseMap();
    cfg.CreateMap<Order, OrderDto>()
        .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
        .ForMember(
            dest => dest.UserName,
            opt => opt.MapFrom(src => src.User != null ? src.User.UserName : null)
        )
        .ReverseMap();
    cfg.CreateMap<User, UserDto>().ReverseMap();
    cfg.CreateMap<Address, AddressDto>().ReverseMap();
    cfg.CreateMap<User, UserDetailDto>()
        .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
        .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName))
        .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
        .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
        .ForMember(dest => dest.Role, opt => opt.MapFrom(src => (int)src.Role))
        .ForMember(
            dest => dest.FavouriteGerners,
            opt => opt.MapFrom(src => src.FavouriteGerners.Select(x => x.Name).ToList())
        )
        .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address))
        .ForMember(dest => dest.BillingAddress, opt => opt.MapFrom(src => src.BillingAddress));
    cfg.CreateMap<Comment, CommentDto>()
        .ForMember(dest => dest.CreatorUserName, opt => opt.MapFrom(src => src.User.UserName))
        .ReverseMap();
});
string csvPath = builder.Configuration.GetSection("MockDataPath").Get<string>();

builder.Services.AddSingleton(new FilePathOptions { CsvPath = csvPath });
builder.Services.AddSingleton(new JwtSecretKey { Key = jwtSecretKey });
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<LoadFromCdbService>();
builder.Services.AddScoped<LoadFromCsvService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAuditService, AuditService>();

builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System
            .Text
            .Json
            .JsonNamingPolicy
            .CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Define the security scheme
    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter your valid JWT token. YOU DO NOT NEED TO WRITE \"Bearer \"!!",
        }
    );

    // Add a requirement that the scheme applies globally
    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer",
                    },
                },
                Array.Empty<string>()
            },
        }
    );
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
    try
    {
        Console.WriteLine("--- ZAHÁJENÍ DB DIAGNOSTIKY ---");

        var cs = dbContext.Database.GetConnectionString();
        Console.WriteLine($"Connection string načten (délka: {cs?.Length ?? 0})");

        Console.WriteLine("Pokus o otevření spojení...");
        dbContext.Database.OpenConnection();
        Console.WriteLine("SPOJENÍ OK!");
        dbContext.Database.CloseConnection();

        try
        {
            Console.WriteLine("Kontrola migrací...");
            if (dbContext.Database.GetPendingMigrations().Any())
            {
                Console.WriteLine("Aplikuji migrace...");
                dbContext.Database.Migrate();
                Console.WriteLine("Migrace dokončeny!");
            }
            else
            {
                Console.WriteLine("Žádné migrace nejsou potřeba.");
            }
        }
        catch (Exception migEx)
        {
            Console.WriteLine($"CHYBA MIGRACÍ: {migEx.Message}");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"KRITICKÁ CHYBA DATABÁZE: {ex.Message}");
        if (ex.InnerException != null)
            Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
    }
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "SPI Project API v1");
    c.RoutePrefix = "docs";
});

app.UseSerilogRequestLogging();

//app.UseHttpsRedirection();

app.UseCors(SPICors);

app.UseAuthorization();

app.MapControllers();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();

if (!app.Environment.IsDevelopment())
{
    app.MapFallbackToFile("index.html");
}

app.Run();

[ExcludeFromCodeCoverage]
public partial class Program { }
