import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService, TaskItem } from '../../services/task.service';
import { Category, CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type Tab = 'new' | 'categories' | 'all';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.css']
})
export class TasksComponent implements OnInit, OnDestroy {
  tasks = signal<TaskItem[]>([]);
  categories = signal<Category[]>([]);
  page = signal(1);
  pageSize = 10;
  total = signal(0);
  search = '';
  selectedCategory: number | null = null;
  newTask: TaskItem = { title: '', description: '', isComplete: false, categoryId: null };
  editTaskId: number | null = null;
  categoryName = '';
  error = signal('');
  activeTab = signal<Tab>('all');
  totalPages = computed(() => Math.ceil(this.total() / this.pageSize));
  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.refreshView();
    
    // Subscribe to refresh notifications
    this.taskService.refresh$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refreshView());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
    if (tab === 'all') {
      this.page.set(1);
      this.refreshView();
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  applyFilters() {
    this.page.set(1);
    this.refreshView();
  }

  clearFilters() {
    this.search = '';
    this.selectedCategory = null;
    this.applyFilters();
  }

  private refreshView(resetPage = false) {
    if (resetPage) {
      this.page.set(1);
    }

    forkJoin({
      tasks: this.taskService.getAll(this.page(), this.pageSize, this.search, this.selectedCategory),
      categories: this.categoryService.getAll()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ tasks, categories }) => {
        this.setTasks(tasks);
        this.categories.set([...categories]);

        if (this.total() > 0 && this.page() > this.totalPages()) {
          this.page.set(this.totalPages());
          this.refreshView();
        }
      });
  }

  private setTasks(result: { items: TaskItem[]; totalCount: number }) {
    this.tasks.set(result.items);
    this.total.set(result.totalCount);
  }

  saveTask() {
    this.error.set('');
    const taskPayload = this.toTaskPayload(this.newTask);

    if (this.editTaskId != null) {
      this.taskService.update(this.editTaskId, taskPayload).subscribe({
        next: () => { 
          this.editTaskId = null; 
          this.newTask = { title: '', description: '', isComplete: false, categoryId: null }; 
          this.activeTab.set('all');
          this.refreshView();
        },
        error: () => this.error.set('Failed to update task.')
      });
      return;
    }

    this.taskService.create(taskPayload).subscribe({
      next: () => { 
        this.newTask = { title: '', description: '', isComplete: false, categoryId: null }; 
        this.activeTab.set('all');
        this.refreshView(true);
      },
      error: () => this.error.set('Failed to create task.')
    });
  }

  private toTaskPayload(task: TaskItem): TaskItem {
    return {
      title: task.title,
      description: task.description,
      isComplete: task.isComplete ?? false,
      categoryId: task.categoryId ?? null
    };
  }

  editTask(task: TaskItem) {
    this.editTaskId = task.id ?? null;
    this.newTask = { ...task };
    this.activeTab.set('new');
  }

  cancelEdit() {
    this.editTaskId = null;
    this.newTask = { title: '', description: '', isComplete: false, categoryId: null };
  }

  deleteTask(id?: number) {
    if (!id || !confirm('Delete this task?')) {
      return;
    }

    this.taskService.delete(id).subscribe(() => this.refreshView());
  }

  deleteCategory(category: Category) {
    if (!category.id || !confirm(`Delete category "${category.name}"? Tasks in this category will be kept without a category.`)) {
      return;
    }

    this.categoryService.delete(category.id).subscribe({
      next: () => {
        if (this.selectedCategory === category.id) {
          this.selectedCategory = null;
          this.page.set(1);
        }

        if (this.newTask.categoryId === category.id) {
          this.newTask.categoryId = null;
        }

        this.refreshView(true);
      },
      error: () => this.error.set('Failed to delete category.')
    });
  }

  toggleComplete(task: TaskItem) {
    this.taskService.update(task.id!, this.toTaskPayload({ ...task, isComplete: !task.isComplete })).subscribe(() => this.refreshView());
  }

  addCategory() {
    this.error.set('');
    if (!this.categoryName.trim()) {
      return;
    }
    const name = this.categoryName.trim();
    this.categoryService.create({ name }).subscribe({
      next: () => {
        this.categoryName = '';
        this.refreshView();
      },
      error: () => this.error.set('Failed to create category. Please log in again or refresh the page.')
    });
  }

  tabClass(tab: Tab) {
    const base = 'rounded-full px-4 py-2 text-sm font-semibold transition';
    const active = 'bg-slate-900 text-white';
    const inactive = 'bg-slate-100 text-slate-700 hover:bg-slate-200';

    return `${base} ${this.activeTab() === tab ? active : inactive}`;
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(page => page - 1);
      this.refreshView();
    }
  }

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.update(page => page + 1);
      this.refreshView();
    }
  }
}
