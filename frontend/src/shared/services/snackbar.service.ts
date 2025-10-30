// filepath: /home/dave/RiderProjects/BankTrackerGraphQL/frontend/src/shared/services/snackbar.service.ts
import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';

export type SnackbarKind = 'success' | 'error' | 'info' | 'warning';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly snackBar = inject(MatSnackBar);

  // Base config used by all snackbars
  private baseConfig(config?: MatSnackBarConfig): MatSnackBarConfig {
    return {
      duration: 3500,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      ...config,
    } satisfies MatSnackBarConfig;
  }

  show(message: string, action: string = 'OK', config?: MatSnackBarConfig): MatSnackBarRef<SimpleSnackBar> {
    return this.snackBar.open(message, action, this.baseConfig(config));
  }

  success(message: string, action: string = 'OK', config?: MatSnackBarConfig): MatSnackBarRef<SimpleSnackBar> {
    return this.show(message, action, {
      panelClass: ['snackbar-success'],
      ...config,
    });
  }

  error(message: string, action: string = 'Dismiss', config?: MatSnackBarConfig): MatSnackBarRef<SimpleSnackBar> {
    return this.show(message, action, {
      panelClass: ['snackbar-error'],
      duration: 5000,
      ...config,
    });
  }

  info(message: string, action: string = 'OK', config?: MatSnackBarConfig): MatSnackBarRef<SimpleSnackBar> {
    return this.show(message, action, {
      panelClass: ['snackbar-info'],
      ...config,
    });
  }

  warning(message: string, action: string = 'OK', config?: MatSnackBarConfig): MatSnackBarRef<SimpleSnackBar> {
    return this.show(message, action, {
      panelClass: ['snackbar-warning'],
      ...config,
    });
  }
}

