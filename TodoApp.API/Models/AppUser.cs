using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace TodoApp.API.Models;

public class AppUser : IdentityUser
{
    [JsonIgnore]
    public List<TaskItem> Tasks { get; set; } = new();
    [JsonIgnore]
    public List<Category> Categories { get; set; } = new();
}
