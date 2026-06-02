namespace TodoApp.API.Models;

public class TaskItem
{
  public required int Id { get; set; }
  public required string Title { get; set; } 
  public string? Description { get; set; }
  public bool IsComplete { get; set; } = false;
  public DateTime CreateAt { get; set; } = DateTime.Now;
}