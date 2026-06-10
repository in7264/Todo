using System.Text.Json.Serialization;

namespace TodoApp.API.Models;

public class Category
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Color { get; set; }
    public string UserId { get; set; } = null!;
    [JsonIgnore]
    public AppUser User { get; set; } = null!;
    [JsonIgnore]
    public List<TaskItem> Tasks { get; set; } = new();
}
