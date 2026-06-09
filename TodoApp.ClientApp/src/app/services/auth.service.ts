import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthDto { email: string; password: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'todo_token';
  private authState = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  isAuthenticated(): Observable<boolean> {
    return this.authState.asObservable();
  }

  login(dto: AuthDto) {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/login`, dto).pipe(
      map((res) => {
        localStorage.setItem(this.tokenKey, res.token);
        this.authState.next(true);
        return res;
      })
    );
  }

  register(dto: AuthDto) {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/register`, dto).pipe(
      map((res) => {
        localStorage.setItem(this.tokenKey, res.token);
        this.authState.next(true);
        return res;
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.authState.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
