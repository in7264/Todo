using Microsoft.EntityFrameworkCore;
using TodoApp.API.DataAccess;
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

    public async Task<List<Category>> GetAllAsync(string userId) =>
        await _context.Categories.Where(c => c.UserId == userId).ToListAsync();

    public async Task<Category> CreateAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (category == null) return false;
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }
}