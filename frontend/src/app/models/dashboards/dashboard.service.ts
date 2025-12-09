import { inject, Injectable, Signal, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  AddWidgetGQL,
  AddWidgetInput,
  CreateDashboardGQL,
  CreateDashboardInput,
  DeleteDashboardGQL,
  GetDashboardGQL,
  GetDashboardsGQL,
  RemoveWidgetGQL,
  UpdateDashboardGQL,
  UpdateDashboardInput,
  UpdateWidgetGQL,
  UpdateWidgetInput,
  DashboardWidgetType,
  DashboardType,
} from '../../../generated/graphql';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { Dashboard, DashboardWidget } from './dashboard';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly getDashboardsGQL = inject(GetDashboardsGQL);
  private readonly getDashboardGQL = inject(GetDashboardGQL);
  private readonly createDashboardGQL = inject(CreateDashboardGQL);
  private readonly updateDashboardGQL = inject(UpdateDashboardGQL);
  private readonly deleteDashboardGQL = inject(DeleteDashboardGQL);
  private readonly addWidgetGQL = inject(AddWidgetGQL);
  private readonly updateWidgetGQL = inject(UpdateWidgetGQL);
  private readonly removeWidgetGQL = inject(RemoveWidgetGQL);
  private readonly snackbar = inject(SnackbarService);

  private readonly _dashboards = signal<readonly Dashboard[]>([]);
  readonly dashboards: Signal<readonly Dashboard[]> = this._dashboards.asReadonly();

  private readonly _selectedDashboard = signal<Dashboard | null>(null);
  readonly selectedDashboard: Signal<Dashboard | null> = this._selectedDashboard.asReadonly();

  private readonly _loading = signal<boolean>(false);
  readonly loading: Signal<boolean> = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error: Signal<string | null> = this._error.asReadonly();

  private mapToDashboardWidget(widget: DashboardWidgetType): DashboardWidget {
    return {
      id: widget.id,
      widgetType: widget.widgetType,
      cols: widget.cols,
      rows: widget.rows,
      x: widget.x,
      y: widget.y,
    };
  }

  private mapToDashboard(dashboard: DashboardType): Dashboard {
    return {
      id: dashboard.id,
      name: dashboard.name,
      widgets: dashboard.widgets.map((w) => this.mapToDashboardWidget(w)),
    };
  }

  async getDashboards(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(this.getDashboardsGQL.fetch());
      if (result?.data?.dashboards) {
        this._dashboards.set(result.data.dashboards.map((d) => this.mapToDashboard(d)));
        this.selectDashboard(this._dashboards()[this._dashboards().length - 1] || null);
      } else {
        this._error.set('Failed to fetch dashboards');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch dashboards';
      this._error.set(message);
      this.snackbar.error(message);
    } finally {
      this._loading.set(false);
    }
  }

  async getDashboard(id: number): Promise<Dashboard | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(this.getDashboardGQL.fetch({ variables: { id } }));
      if (result?.data?.dashboard) {
        const dashboard = this.mapToDashboard(result.data.dashboard);
        this._dashboards.update((dashboards) =>
          dashboards.map((d) => (d.id === dashboard.id ? dashboard : d)),
        );
        this._selectedDashboard.set(dashboard);
        return dashboard;
      }
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch dashboard';
      this._error.set(message);
      this.snackbar.error(message);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async createDashboard(input: CreateDashboardInput): Promise<Dashboard | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.createDashboardGQL.mutate({
          variables: {
            input,
          },
        }),
      );

      if (result?.data?.createDashboard) {
        const newDashboard = this.mapToDashboard(result.data.createDashboard);
        this._dashboards.update((dashboards) => [...dashboards, newDashboard]);
        this.selectDashboard(newDashboard);
        this.snackbar.success('Dashboard created successfully');
        return newDashboard;
      }
      this._error.set('Failed to create dashboard');
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create dashboard';
      this._error.set(message);
      this.snackbar.error(message);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async updateDashboard(input: UpdateDashboardInput): Promise<Dashboard | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.updateDashboardGQL.mutate({
          variables: {
            input,
          },
        }),
      );

      if (result?.data?.updateDashboard) {
        const updatedDashboard = this.mapToDashboard(result.data.updateDashboard);
        this._dashboards.update((dashboards) =>
          dashboards.map((d) => (d.id === updatedDashboard.id ? updatedDashboard : d)),
        );
        if (this._selectedDashboard()?.id === updatedDashboard.id) {
          this._selectedDashboard.set(updatedDashboard);
        }
        this.snackbar.success('Dashboard updated successfully');
        return updatedDashboard;
      }
      this._error.set('Failed to update dashboard');
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update dashboard';
      this._error.set(message);
      this.snackbar.error(message);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async deleteDashboard(id: number): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(this.deleteDashboardGQL.mutate({ variables: { id } }));

      if (result?.data?.deleteDashboard) {
        const wasSelected = this._selectedDashboard()?.id === id;
        const updatedDashboards = this._dashboards().filter((d) => d.id !== id);
        this._dashboards.set(updatedDashboards);
        
        if (wasSelected) {
          if (updatedDashboards.length > 0) {
            this._selectedDashboard.set(updatedDashboards[updatedDashboards.length - 1]);
          } else {
            this._selectedDashboard.set(null);
          }
        }
        this.snackbar.success('Dashboard deleted successfully');
        return true;
      }
      this._error.set('Failed to delete dashboard');
      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete dashboard';
      this._error.set(message);
      this.snackbar.error(message);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  async addWidget(input: AddWidgetInput): Promise<DashboardWidget | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.addWidgetGQL.mutate({
          variables: { input },
        }),
      );

      if (result?.data?.addWidget) {
        const newWidget = this.mapToDashboardWidget(result.data.addWidget);
        this._dashboards.update((dashboards) =>
          dashboards.map((d) =>
            d.id === input.dashboardId ? { ...d, widgets: [...d.widgets, newWidget] } : d,
          ),
        );
        if (this._selectedDashboard()?.id === input.dashboardId) {
          this._selectedDashboard.update((dashboard) =>
            dashboard ? { ...dashboard, widgets: [...dashboard.widgets, newWidget] } : null,
          );
        }
        this.snackbar.success('Widget added successfully');
        return newWidget;
      }
      this._error.set('Failed to add widget');
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add widget';
      this._error.set(message);
      this.snackbar.error(message);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async updateWidget(input: UpdateWidgetInput): Promise<DashboardWidget | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(
        this.updateWidgetGQL.mutate({
          variables: { input },
        }),
      );

      if (result?.data?.updateWidget) {
        const updatedWidget = this.mapToDashboardWidget(result.data.updateWidget);
        this._dashboards.update((dashboards) =>
          dashboards.map((d) => ({
            ...d,
            widgets: d.widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w)),
          })),
        );
        if (this._selectedDashboard()) {
          this._selectedDashboard.update((dashboard) =>
            dashboard
              ? {
                  ...dashboard,
                  widgets: dashboard.widgets.map((w) =>
                    w.id === updatedWidget.id ? updatedWidget : w,
                  ),
                }
              : null,
          );
        }
        this.snackbar.success('Widget updated successfully');
        return updatedWidget;
      }
      this._error.set('Failed to update widget');
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update widget';
      this._error.set(message);
      this.snackbar.error(message);
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  async removeWidget(id: number): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const result = await firstValueFrom(this.removeWidgetGQL.mutate({ variables: { id } }));

      if (result?.data?.removeWidget) {
        this._dashboards.update((dashboards) =>
          dashboards.map((d) => ({
            ...d,
            widgets: d.widgets.filter((w) => w.id !== id),
          })),
        );
        if (this._selectedDashboard()) {
          this._selectedDashboard.update((dashboard) =>
            dashboard
              ? { ...dashboard, widgets: dashboard.widgets.filter((w) => w.id !== id) }
              : null,
          );
        }
        this.snackbar.success('Widget removed successfully');
        return true;
      }
      this._error.set('Failed to remove widget');
      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove widget';
      this._error.set(message);
      this.snackbar.error(message);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  selectDashboard(dashboard: Dashboard | null): void {
    this._selectedDashboard.set(dashboard);
  }

  clearError(): void {
    this._error.set(null);
  }
}
