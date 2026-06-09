import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed right-4 bottom-4 z-50 flex flex-col space-y-2 items-end pointer-events-none">
      <div *ngFor="let t of toasts" class="pointer-events-auto max-w-xs rounded-lg bg-slate-900 text-white px-4 py-2 shadow-lg">
        {{ t.message }}
      </div>
    </div>
  `
})
export class ToastComponent implements OnInit {
  toasts: Array<{ id: number; message: string }> = [];
  private nextId = 0;

  constructor(private toast: ToastService) {}

  ngOnInit() {
    this.toast.messages.subscribe((m: ToastMessage) => {
      const id = ++this.nextId;
      this.toasts.push({ id, message: m.message });
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, m.timeout ?? 5000);
    });
  }
}
