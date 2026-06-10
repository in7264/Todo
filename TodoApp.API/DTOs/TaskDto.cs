namespace TodoApp.API.DTOs;

public class TaskDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public bool IsComplete { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? CategoryId { get; set; }
    public TaskCategoryDto? Category { get; set; }
}
