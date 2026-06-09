import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { TasksComponent } from './components/tasks/tasks';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'tasks', component: TasksComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'tasks' }
];
