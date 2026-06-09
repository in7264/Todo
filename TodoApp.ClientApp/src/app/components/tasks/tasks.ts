import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
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
  imports: [FormsModule, NgFor, NgIf, NgClass],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.css']
})
export class TasksComponent implements OnInit, OnDestroy {
  tasks: TaskItem[] = [];
  categories: Category[] = [];
  page = 1;
  pageSize = 10;
  total = 0;
  search = '';
  selectedCategory: number | null = null;
  newTask: TaskItem = { title: '', description: '', isComplete: false, categoryId: null };
  editTaskId: number | null = null;
  categoryName = '';
  error = '';
  activeTab: Tab = 'all';
  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private auth: AuthService,
    private router: Router,
    private zone: NgZone,
    private cd: ChangeDetectorRef
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
    this.activeTab = tab;
    if (tab === 'all') {
      this.page = 1;
      this.refreshView();
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  load() {
    this.taskService.getAll(this.page, this.pageSize, this.search, this.selectedCategory).subscribe((result) => {
      this.setTasks(result);
    });
  }

  applyFilters() {
    this.page = 1;
    this.refreshView();
  }

  clearFilters() {
    this.search = '';
    this.selectedCategory = null;
    this.applyFilters();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe((items) => this.setCategories(items));
  }

  private refreshView(resetPage = false) {
    if (resetPage) {
      this.page = 1;
    }

    forkJoin({
      tasks: this.taskService.getAll(this.page, this.pageSize, this.search, this.selectedCategory),
      categories: this.categoryService.getAll()
    }).subscribe(({ tasks, categories }) => {
      this.zone.run(() => {
        this.setTasks(tasks);
        this.categories = [...categories];
        this.cd.detectChanges();

        if (this.total > 0 && this.page > this.totalPages) {
          this.page = this.totalPages;
          this.refreshView();
        }
      });
    });
  }

  private setTasks(result: { items: TaskItem[]; totalCount: number }) {
    this.tasks = result.items;
    this.total = result.totalCount;
  }

  private setCategories(items: Category[]) {
    this.zone.run(() => {
      this.categories = [...items];
      this.cd.detectChanges();
    });
  }

  saveTask() {
    this.error = '';
    const taskPayload = this.toTaskPayload(this.newTask);

    if (this.editTaskId != null) {
      this.taskService.update(this.editTaskId, taskPayload).subscribe({
        next: () => { 
          this.editTaskId = null; 
          this.newTask = { title: '', description: '', isComplete: false, categoryId: null }; 
          this.activeTab = 'all';
          this.refreshView();
        },
        error: () => this.error = 'Failed to update task.'
      });
      return;
    }

    this.taskService.create(taskPayload).subscribe({
      next: () => { 
        this.newTask = { title: '', description: '', isComplete: false, categoryId: null }; 
        this.activeTab = 'all';
        this.refreshView(true);
      },
      error: () => this.error = 'Failed to create task.'
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
    this.activeTab = 'new';
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
          this.page = 1;
        }

        if (this.newTask.categoryId === category.id) {
          this.newTask.categoryId = null;
        }

        this.refreshView(true);
      },
      error: () => this.error = 'Failed to delete category.'
    });
  }

  toggleComplete(task: TaskItem) {
    this.taskService.update(task.id!, this.toTaskPayload({ ...task, isComplete: !task.isComplete })).subscribe(() => this.refreshView());
  }

  addCategory() {
    this.error = '';
    if (!this.categoryName.trim()) {
      return;
    }
    const name = this.categoryName.trim();
    this.categoryService.create({ name }).subscribe({
      next: () => {
        this.categoryName = '';
        this.refreshView();
      },
      error: () => {
        this.error = 'Failed to create category. Please log in again or refresh the page.';
        this.cd.detectChanges();
      }
    });
  }

  get totalPages() {
    return Math.ceil(this.total / this.pageSize);
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.load();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.load();
    }
  }
}
