import { Component, DestroyRef, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed right-4 bottom-4 z-50 flex flex-col space-y-2 items-end pointer-events-none">
      @for (toast of toasts(); track toast.id) {
        <div class="pointer-events-auto max-w-xs rounded-lg bg-slate-900 text-white px-4 py-2 shadow-lg">
          {{ toast.message }}
        </div>
      }
    </div>
  `
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts = signal<Array<{ id: number; message: string }>>([]);
  private nextId = 0;
  private timeouts = new Set<ReturnType<typeof setTimeout>>();

  constructor(
    private toast: ToastService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit() {
    this.toast.messages
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((m: ToastMessage) => {
        const id = ++this.nextId;
        this.toasts.update(toasts => [...toasts, { id, message: m.message }]);
        const timeoutId = setTimeout(() => {
          this.toasts.update(toasts => toasts.filter(t => t.id !== id));
          this.timeouts.delete(timeoutId);
        }, m.timeout ?? 5000);
        this.timeouts.add(timeoutId);
      });
  }

  ngOnDestroy() {
    this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeouts.clear();
  }
}
