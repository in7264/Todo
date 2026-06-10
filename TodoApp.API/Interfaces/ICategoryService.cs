using TodoApp.API.DTOs;

namespace TodoApp.API.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync(string userId);
    Task<CategoryDto?> GetByIdAsync(int id, string userId);
    Task<CategoryDto> CreateAsync(CategoryCreateDto category, string userId);
    Task<bool> DeleteAsync(int id, string userId);
}
