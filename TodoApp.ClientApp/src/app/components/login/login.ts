import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './login.html'
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  info = '';
  error = '';
  errorMessages: string[] = [];
  mode: 'login' | 'register' = 'login';
  showValidationErrors = false;

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
    private toast: ToastService,
    private cd: ChangeDetectorRef
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
    this.info = '';
    this.error = '';
    this.errorMessages = [];

    // Mark all fields as touched to show validation errors immediately
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    // If form is invalid, don't submit to server
    if (this.form.invalid) {
      this.showValidationErrors = true;
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

        if (Array.isArray(response)) {
          this.errorMessages = response.map((item: any) => item?.description || item?.code || JSON.stringify(item));
        } else if (response?.errors) {
          const errors = response.errors;
          this.errorMessages = Object.values(errors)
            .flatMap((value: any) => Array.isArray(value) ? value : [value])
            .map((item: any) => typeof item === 'string' ? item : JSON.stringify(item));
        } else if (response?.description) {
          this.errorMessages = [response.description];
        } else if (response?.Message) {
          this.errorMessages = [response.Message];
        } else if (typeof response === 'string' && response.trim().length) {
          this.error = response;
        } else if (response && typeof response === 'object') {
          this.errorMessages = [JSON.stringify(response)];
        } else if (statusText || status) {
          this.error = `Request failed${status ? ` (${status})` : ''}${statusText ? `: ${statusText}` : ''}`;
        } else {
          this.error = 'Authentication failed. Please check the highlighted errors.';
        }

        if (!this.error && this.errorMessages.length) {
          this.error = 'Registration failed. See details below.';
        }

        // Ensure Angular updates the view immediately. Sometimes async errors
        // are delivered outside the zone or don't trigger CD; force a check.
        try {
          this.cd.detectChanges();
        } catch (e) {
          // noop
        }
      }
    });
  }

  toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.initializeForm();
    this.info = '';
    this.error = '';
    this.errorMessages = [];
    this.showValidationErrors = false;
  }
}
