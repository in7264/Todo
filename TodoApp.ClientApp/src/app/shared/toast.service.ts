import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ToastMessage {
  message: string;
  timeout?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private subject = new Subject<ToastMessage>();

  get messages(): Observable<ToastMessage> {
    return this.subject.asObservable();
  }

  show(message: string, timeout = 5000) {
    this.subject.next({ message, timeout });
  }
}
