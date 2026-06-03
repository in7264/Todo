using Microsoft.AspNetCore.Identity;
using TodoApp.API.Models;

public class AppUser : IdentityUser
{
    public List<TaskItem> Tasks { get; set; } = new();
    public List<Category> Categories { get; set; } = new();
}