using DotNetEnv;
using EFModels.Data;
using EFModels.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;
using WEA_BE.DTO;
using WEA_BE.Models;
using WEA_BE.Services;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

Env.Load(".env");

var jwtSecretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");

builder.Host.UseSerilog((context, loggerConfiguration) =>
{
    loggerConfiguration.WriteTo.Console();
    loggerConfiguration.ReadFrom.Configuration(context.Configuration);
});
builder.Services.AddDbContext<DatabaseContext>(options =>
{
    var ConnectionString = builder.Configuration.GetConnectionString("Default");
    var serverVersion = ServerVersion.AutoDetect(ConnectionString);
    options.UseMySql(ConnectionString, serverVersion, o => { o.EnableRetryOnFailure(10, TimeSpan.FromSeconds(30), null); });
});

var WEACors = "_WEACors";

builder.Services.AddCors(options =>
{
    options.AddPolicy(WEACors,
        policy =>
        {
            policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
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
    cfg.CreateMap<Book, BookDto>().ReverseMap();
    cfg.CreateMap<Book, BookSimpleDto>().ReverseMap();
    cfg.CreateMap<AuditLog, AuditLogDto>().ReverseMap();
    cfg.CreateMap<Order, OrderDto>().ReverseMap();
    cfg.CreateMap<User, UserDto>().ReverseMap();
    cfg.CreateMap<Address, AddressDto>().ReverseMap();
    cfg.CreateMap<User, UserDetailDto>()
       .ForMember(dest => dest.FavouriteGerners, opt =>
           opt.MapFrom(src => src.FavouriteGerners.Select(x => x.Name).ToList()))
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

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Define the security scheme
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your valid JWT token. YOU DO NOT NEED TO WRITE \"Bearer \"!!"
    });

    // Add a requirement that the scheme applies globally
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
    try
    {
        // Attempt to open a connection to the database
        dbContext.Database.OpenConnection();
        Console.WriteLine("Database connection successful!");
        dbContext.Database.CloseConnection();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database connection failed: {ex.Message}");
    }

    // migrate if needed, doing this with docker sucks in this stack
    if (dbContext.Database.GetPendingMigrations().Any())
    {
        dbContext.Database.Migrate();
    }

}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "WEA Project API v1");
    c.RoutePrefix = "docs";
});

app.UseSerilogRequestLogging();

//app.UseHttpsRedirection();

app.UseCors(WEACors);

app.UseAuthorization();

app.MapControllers();

app.Run();
