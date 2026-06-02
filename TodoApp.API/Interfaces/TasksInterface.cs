using TodoApp.API.Models;

namespace TodoApp.API.Interfaces;

public interface TasksInterface
{
  Task<List<TaskItem>> GetAllA();
  Task<TaskItem?> GetByIdA(int id);
  Task<TaskItem> CreateA(TaskItem task);
  Task<TaskItem?> UpdateA(int id, TaskItem task);
  Task<bool> DeleteA(int id);
}