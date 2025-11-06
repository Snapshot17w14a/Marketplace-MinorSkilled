using System.Text;
using Backend.Database;
using Backend.Iterfaces;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

IdentityModelEventSource.ShowPII = true;

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
    string? JWTSymKeySecret = config.GetSection("Secrets").GetValue<string>("JWTSymKeySecret");
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

builder.Services.AddSingleton<PasswordHashService>();
builder.Services.AddScoped<JWTGeneratorService>();
builder.Services.AddScoped<IEmailClient, BrevoEmailClient>();

if (builder.Environment.IsDevelopment())
{
    //Allow frontend to make calls from local network with CORS
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    });
}

var app = builder.Build();

//Configure brevo client configuration
var apiKey = config.GetSection("Secrets")["BrevoAPIKey"];
if (string.IsNullOrEmpty(apiKey)) throw new Exception("The mail client API key could not be found in the config");
brevo_csharp.Client.Configuration.Default.ApiKey.Add("api-key", apiKey);

//Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    //Enable CORS for local hosted frontend
    app.UseCors("AllowFrontend");
}

app.UseStaticFiles((new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "http://localhost:5173");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type");
    }
}));

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.Run();
