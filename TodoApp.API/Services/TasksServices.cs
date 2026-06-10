using Microsoft.EntityFrameworkCore;
using TodoApp.API.DataAccess;
using TodoApp.API.DTOs;
using TodoApp.API.Interfaces;
using TodoApp.API.Models;

namespace TodoApp.API.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;

    public TaskService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<TaskDto>> GetAllAsync(string userId, TaskQueryDto queryDto)
    {
        var query = _context.Tasks
            .AsNoTracking()
            .Where(t => t.UserId == userId);

        if (!string.IsNullOrWhiteSpace(queryDto.Search))
            query = query.Where(t => t.Title.Contains(queryDto.Search) || (t.Description != null && t.Description.Contains(queryDto.Search)));

        if (queryDto.CategoryId.HasValue)
            query = query.Where(t => t.CategoryId == queryDto.CategoryId);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((queryDto.Page - 1) * queryDto.PageSize)
            .Take(queryDto.PageSize)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                IsComplete = t.IsComplete,
                CreatedAt = t.CreatedAt,
                CategoryId = t.CategoryId,
                Category = t.Category == null ? null : new TaskCategoryDto
                {
                    Id = t.Category.Id,
                    Name = t.Category.Name,
                    Color = t.Category.Color
                }
            })
            .ToListAsync();

        return new PagedResult<TaskDto>
        {
            Items = items,
            TotalCount = total,
            Page = queryDto.Page,
            PageSize = queryDto.PageSize
        };
    }

    public async Task<TaskDto?> GetByIdAsync(int id, string userId) =>
        await _context.Tasks
            .AsNoTracking()
            .Where(t => t.Id == id && t.UserId == userId)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                IsComplete = t.IsComplete,
                CreatedAt = t.CreatedAt,
                CategoryId = t.CategoryId,
                Category = t.Category == null ? null : new TaskCategoryDto
                {
                    Id = t.Category.Id,
                    Name = t.Category.Name,
                    Color = t.Category.Color
                }
            })
            .FirstOrDefaultAsync();

    public async Task<TaskDto> CreateAsync(TaskCreateDto taskDto, string userId)
    {
        var task = new TaskItem
        {
            Title = taskDto.Title,
            Description = taskDto.Description,
            IsComplete = taskDto.IsComplete,
            CategoryId = taskDto.CategoryId,
            UserId = userId
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(task.Id, userId))!;
    }

    public async Task<TaskDto?> UpdateAsync(int id, TaskCreateDto updatedTask, string userId)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (task == null) return null;

        task.Title = updatedTask.Title;
        task.Description = updatedTask.Description;
        task.IsComplete = updatedTask.IsComplete;
        task.CategoryId = updatedTask.CategoryId;

        await _context.SaveChangesAsync();
        return await GetByIdAsync(id, userId);
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (task == null) return false;

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return true;
    }
}
