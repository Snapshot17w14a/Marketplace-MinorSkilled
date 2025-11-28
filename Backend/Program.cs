using System.Text;
using Backend.Database;
using Backend.Extensions;
using Backend.Interfaces;
using Backend.Iterfaces;
using Backend.Middleware;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false)
    .AddUserSecrets<Program>(optional: true)
    .AddEnvironmentVariables();

var config = builder.Configuration;

IdentityModelEventSource.ShowPII = builder.Environment.IsDevelopment();

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(config.GetConnectionString("DefaultConnection"))
);

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    string? JWTSymKeySecret = config["Secrets:JWTSymKeySecret"];
    if (string.IsNullOrEmpty(JWTSymKeySecret)) throw new Exception("JWTSymKeySecret was not found in configuration");

    options.TokenValidationParameters = new()
    {
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JWTSymKeySecret)),
        ValidIssuer = "https://api.mkev.dev",
        ValidAudience = "https://marketplace.mkev.dev",
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
    };
});

builder.Services.AddScoped<RoleManager>();

builder.Services.AddSingleton<PasswordHashService>();
builder.Services.AddScoped<JWTGeneratorService>();
builder.Services.AddScoped<IEmailClient, BrevoEmailClient>();
builder.Services.AddScoped<I2FAProvider, OtpNET2FAProvider>();

 // Allow frontend to make calls from local network with CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(builder.Environment.IsDevelopment() ? "http://localhost:5173" : "https://marketplace.mkev.dev")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure brevo client configuration
var apiKey = config["Secrets:BrevoAPIKey"];
if (string.IsNullOrEmpty(apiKey)) throw new Exception("The mail client API key could not be found in the config");
brevo_csharp.Client.Configuration.Default.ApiKey.Add("api-key", apiKey);

app.Use(async (context, next) =>
{
    Console.WriteLine("Incoming request:");
    Console.WriteLine("Authorization: " + context.Request.Headers["Authorization"]);
    await next();
});

//Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS for same origin fronend access
app.UseCors("AllowFrontend");

app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

await app.SeedPermissionRoles();
app.UseMiddleware<SimpleAuthorization>();

app.MapControllers();

app.Run();