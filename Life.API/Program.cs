using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore;
using Life.Data.Entities;
using Life.Data.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<LifeDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("LifeDB"))
);
builder.Services.AddScoped<PatternRepository>();

var allowMySites = "_AllowMySites";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: allowMySites, policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
//    //app.UseSwagger();
//    //app.UseSwaggerUI();
//}

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseCors(allowMySites);

app.UseAuthorization();

app.MapControllers();

app.Run();
