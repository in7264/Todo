import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html'
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  info = signal('');
  error = signal('');
  errorMessages = signal<string[]>([]);
  mode: 'login' | 'register' = 'login';
  showValidationErrors = signal(false);

  // Custom validators
  private passwordValidators(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const errors: ValidationErrors = {};

    if (!/[A-Z]/.test(value)) {
      errors['uppercase'] = true;
    }
    if (!/[a-z]/.test(value)) {
      errors['lowercase'] = true;
    }
    if (!/\d/.test(value)) {
      errors['digit'] = true;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      errors['specialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  constructor(
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    const passwordValidators = [Validators.required, Validators.minLength(6)];
    
    // Add strict password validation only for registration mode
    if (this.mode === 'register') {
      passwordValidators.push(this.passwordValidators.bind(this));
    }

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', passwordValidators]
    });
  }

  submit() {
    this.info.set('');
    this.error.set('');
    this.errorMessages.set([]);

    // Mark all fields as touched to show validation errors immediately
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    // If form is invalid, don't submit to server
    if (this.form.invalid) {
      this.showValidationErrors.set(true);
      return;
    }

    const credentials = this.form.value;
    const action = this.mode === 'login'
      ? this.auth.login(credentials)
      : this.auth.register(credentials);

    (action as any).subscribe({
      next: () => {
        if (this.mode === 'login') {
          this.router.navigate(['/tasks']);
        } else {
          this.toast.show('Registration successful');
          this.router.navigate(['/tasks']);
        }
      },
      error: (err: any) => {
        const response = err?.error;
        const statusText = err?.statusText;
        const status = err?.status;

        if (status === 0) {
          this.error.set('API is unavailable. Check that the backend is running, the API URL is correct, and CORS allows this frontend.');
        } else if (Array.isArray(response)) {
          this.errorMessages.set(response.map((item: any) => item?.description || item?.code || JSON.stringify(item)));
        } else if (response?.errors) {
          const errors = response.errors;
          this.errorMessages.set(Object.values(errors)
            .flatMap((value: any) => Array.isArray(value) ? value : [value])
            .map((item: any) => typeof item === 'string' ? item : JSON.stringify(item)));
        } else if (response?.description) {
          this.errorMessages.set([response.description]);
        } else if (response?.Message) {
          this.errorMessages.set([response.Message]);
        } else if (typeof response === 'string' && response.trim().length) {
          this.error.set(response);
        } else if (response && typeof response === 'object' && !(response instanceof ProgressEvent)) {
          this.errorMessages.set([JSON.stringify(response)]);
        } else if (statusText || status) {
          this.error.set(`Request failed${status ? ` (${status})` : ''}${statusText ? `: ${statusText}` : ''}`);
        } else {
          this.error.set('Authentication failed. Please check the highlighted errors.');
        }

        if (!this.error() && this.errorMessages().length) {
          this.error.set('Registration failed. See details below.');
        }

      }
    });
  }

  toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.initializeForm();
    this.info.set('');
    this.error.set('');
    this.errorMessages.set([]);
    this.showValidationErrors.set(false);
  }
}
