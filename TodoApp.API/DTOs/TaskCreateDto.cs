using System.ComponentModel.DataAnnotations;

namespace TodoApp.API.DTOs;

public class TaskCreateDto
{
    [Required]
    [MaxLength(200)]
    public required string Title { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    public bool IsComplete { get; set; } = false;

    [Range(1, int.MaxValue)]
    public int? CategoryId { get; set; }
}
