using TodoApp.API.Models;

namespace TodoApp.API.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync(string userId);
    Task<Category> CreateAsync(Category category);
    Task<bool> DeleteAsync(int id, string userId);
}
