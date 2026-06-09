using TodoApp.API.Models;

namespace TodoApp.API.Interfaces;

public interface TasksInterface
{
    Task<PagedResult<TaskItem>> GetAllA(string userId, int page, int pageSize, string? search, int? categoryId);
    Task<TaskItem?> GetByIdA(int id, string userId);
    Task<TaskItem> CreateA(TaskItem task);
    Task<TaskItem?> UpdateA(int id, TaskCreateDto task, string userId);
    Task<bool> DeleteA(int id, string userId);
}
