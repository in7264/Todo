import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Category {
  id?: number;
  name: string;
  color?: string;
  taskCount?: number;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }

  create(category: Category) {
    return this.http.post<Category>(`${environment.apiUrl}/categories`, category);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/categories/${id}`);
  }
}
