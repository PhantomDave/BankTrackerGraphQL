import {ChangeDetectionStrategy, Component, output, signal} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-configurator',
  imports: [MatTableModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './configurator-component.html',
  styleUrl: './configurator-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguratorComponent {
  readonly data = signal([
    {
      name: 'Sample Configuration',
      description: 'This is a sample configuration for demonstration purposes.',
    },
    {
      name: 'Sample Configuration',
      description: 'This is a sample configuration for demonstration purposes.',
    },
    {
      name: 'Sample Configuration',
      description: 'This is a sample configuration for demonstration purposes.',
    },
    {
      name: 'Sample Configuration',
      description: 'This is a sample configuration for demonstration purposes.',
    },
    {
      name: 'Sample Configuration',
      description: 'This is a sample configuration for demonstration purposes.',
    },
  ]);

  displayedColumns: string[] = ['name', 'description'];

  createConfiguration = output<void>();

  onCreateClicked(): void {
    this.createConfiguration.emit();
  }
}
