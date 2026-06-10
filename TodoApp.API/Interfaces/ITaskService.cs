using TodoApp.API.DTOs;

namespace TodoApp.API.Interfaces;

public interface ITaskService
{
    Task<PagedResult<TaskDto>> GetAllAsync(string userId, TaskQueryDto query);
    Task<TaskDto?> GetByIdAsync(int id, string userId);
    Task<TaskDto> CreateAsync(TaskCreateDto task, string userId);
    Task<TaskDto?> UpdateAsync(int id, TaskCreateDto task, string userId);
    Task<bool> DeleteAsync(int id, string userId);
}
