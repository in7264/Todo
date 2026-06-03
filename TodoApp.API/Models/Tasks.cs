namespace TodoApp.API.Models;

public class TaskItem
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public bool IsComplete { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; } = null!;
    public AppUser User { get; set; } = null!;
    public int? CategoryId { get; set; }
    public Category? Category { get; set; }
}