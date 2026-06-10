using System.ComponentModel.DataAnnotations;

namespace TodoApp.API.DTOs;

public class CategoryCreateDto
{
    [Required]
    [MaxLength(100)]
    public required string Name { get; set; }

    [MaxLength(32)]
    public string? Color { get; set; }
}
