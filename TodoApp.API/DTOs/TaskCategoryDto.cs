namespace TodoApp.API.DTOs;

public class TaskCategoryDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Color { get; set; }
}
