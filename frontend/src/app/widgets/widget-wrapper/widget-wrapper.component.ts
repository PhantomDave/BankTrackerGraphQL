import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FlexComponent } from '../../components/ui-library/flex-component/flex-component';

@Component({
  selector: 'app-widget-wrapper',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatIcon,
    MatIconButton,
    MatCardContent,
    MatProgressSpinner,
    FlexComponent,
  ],
  templateUrl: './widget-wrapper.component.html',
  styleUrl: './widget-wrapper.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetWrapperComponent {
  readonly title = input<string>('');
  readonly widgetId = input.required<number>();
  readonly subtitle = input<string>('');
  readonly icon = input<string>('');
  readonly loading = input<boolean>(false);
  readonly isEditMode = input<boolean>(false);
  delete = output<number>();

  protected deleteWidget() {
    this.delete.emit(this.widgetId());
  }
}
