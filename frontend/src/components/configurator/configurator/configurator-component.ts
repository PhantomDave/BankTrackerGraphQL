import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';

@Component({
  selector: 'app-configurator',
  imports: [MatTableModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './configurator-component.html',
  styleUrl: './configurator-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ConfiguratorComponent {
  private readonly router = inject(Router);
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

  async onCreateClicked(): Promise<void> {
    await this.router.navigate(['/config/create']);
  }
}

export default ConfiguratorComponent
