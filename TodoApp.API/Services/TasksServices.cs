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

    public async Task<List<TaskItem>> GetAllA()
    {
        return await _context.Tasks.ToListAsync();
    }

    public async Task<TaskItem?> GetByIdA(int id)
    {
        return await _context.Tasks.FindAsync(id);
    }

    public async Task<TaskItem> CreateA(TaskItem task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task<TaskItem?> UpdateA(int id, TaskItem updatedTask)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return null;

        task.Title = updatedTask.Title;
        task.Description = updatedTask.Description;
        task.IsComplete = updatedTask.IsComplete;

        await _context.SaveChangesAsync();
        return task;
    }

    public async Task<bool> DeleteA(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null) return false;

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return true;
    }
}