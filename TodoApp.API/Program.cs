using Microsoft.EntityFrameworkCore;
using TodoApp.API.DataAccess;
using TodoApp.API.Interfaces;
using TodoApp.API.Services;

var builder = WebApplication.CreateBuilder(args);

var rawConn = builder.Configuration.GetConnectionString("DefaultConnection")!;

string connString;
if (rawConn.StartsWith("postgresql://") || rawConn.StartsWith("postgres://"))
{
    var uri = new Uri(rawConn);
    var userInfo = uri.UserInfo.Split(':');
    connString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
}
else
{
    connString = rawConn;
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connString));

builder.Services.AddScoped<TasksInterface, TaskService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();