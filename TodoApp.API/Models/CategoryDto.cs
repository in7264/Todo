namespace TodoApp.API.Models;

public class CategoryDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Color { get; set; }
    public int TaskCount { get; set; }
}
