using Microsoft.EntityFrameworkCore;
using TodoApp.API.DataAccess;
using TodoApp.API.DTOs;
using TodoApp.API.Interfaces;
using TodoApp.API.Models;

namespace TodoApp.API.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetAllAsync(string userId) =>
        await _context.Categories
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Color = c.Color,
                TaskCount = _context.Tasks.Count(t => t.UserId == userId && t.CategoryId == c.Id)
            })
            .ToListAsync();

    public async Task<CategoryDto?> GetByIdAsync(int id, string userId) =>
        await _context.Categories
            .AsNoTracking()
            .Where(c => c.Id == id && c.UserId == userId)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Color = c.Color,
                TaskCount = _context.Tasks.Count(t => t.UserId == userId && t.CategoryId == c.Id)
            })
            .FirstOrDefaultAsync();

    public async Task<CategoryDto> CreateAsync(CategoryCreateDto categoryDto, string userId)
    {
        var category = new Category
        {
            Name = categoryDto.Name,
            Color = categoryDto.Color,
            UserId = userId
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(category.Id, userId))!;
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (category == null) return false;

        await _context.Tasks
            .Where(t => t.UserId == userId && t.CategoryId == id)
            .ExecuteUpdateAsync(setters => setters.SetProperty(t => t.CategoryId, (int?)null));

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }
}
