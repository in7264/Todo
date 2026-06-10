using System.ComponentModel.DataAnnotations;

namespace TodoApp.API.DTOs;

public class AuthDto
{
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public required string Email { get; set; }

    [Required]
    [MinLength(6)]
    [MaxLength(100)]
    public required string Password { get; set; }
}
