using Microsoft.EntityFrameworkCore;
using TodoApp.API.DataAccess;
using TodoApp.API.Interfaces;
using TodoApp.API.Models;

namespace TodoApp.API.Services;

public class TaskService : TasksInterface
{
    private readonly AppDbContext _context;

    public TaskService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<TaskItem>> GetAllA(string userId, int page, int pageSize, string? search, int? categoryId)
    {
        var query = _context.Tasks
            .Include(t => t.Category)
            .Where(t => t.UserId == userId);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(t => t.Title.Contains(search) || (t.Description != null && t.Description.Contains(search)));

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<TaskItem>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<TaskItem?> GetByIdA(int id, string userId) =>
        await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

    public async Task<TaskItem> CreateA(TaskItem task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task<TaskItem?> UpdateA(int id, TaskItem updatedTask, string userId)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (task == null) return null;

        task.Title = updatedTask.Title;
        task.Description = updatedTask.Description;
        task.IsComplete = updatedTask.IsComplete;
        task.CategoryId = updatedTask.CategoryId;

        await _context.SaveChangesAsync();
        return task;
    }

    public async Task<bool> DeleteA(int id, string userId)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (task == null) return false;

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return true;
    }
}