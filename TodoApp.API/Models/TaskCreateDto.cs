namespace TodoApp.API.Models;

public class TaskCreateDto
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public bool IsComplete { get; set; } = false;
    public int? CategoryId { get; set; }
}
