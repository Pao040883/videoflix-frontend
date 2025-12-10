import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss'
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts$;

  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  handleAction(toast: Toast): void {
    if (toast.action?.callback) {
      toast.action.callback();
    }
    this.removeToast(toast.id);
  }
}
