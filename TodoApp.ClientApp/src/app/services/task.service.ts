import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TaskItem {
  id?: number;
  title: string;
  description?: string;
  isComplete?: boolean;
  categoryId?: number | null;
  createdAt?: string;
  category?: { name: string };
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private refreshSubject = new Subject<void>();
  public refresh$ = this.refreshSubject.asObservable();

  constructor(private http: HttpClient) {}

  notifyRefresh() {
    this.refreshSubject.next();
  }

  getAll(page = 1, pageSize = 10, search?: string, categoryId?: number | null) {
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    if (search) params = params.set('search', search);
    if (categoryId != null) params = params.set('categoryId', String(categoryId));
    return this.http.get<PagedResult<TaskItem>>(`${environment.apiUrl}/tasks`, { params });
  }

  create(task: TaskItem) {
    return this.http.post<TaskItem>(`${environment.apiUrl}/tasks`, task);
  }

  update(id: number, task: TaskItem) {
    return this.http.put<TaskItem>(`${environment.apiUrl}/tasks/${id}`, task);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/tasks/${id}`);
  }

  triggerRefresh() {
    this.notifyRefresh();
  }
}
