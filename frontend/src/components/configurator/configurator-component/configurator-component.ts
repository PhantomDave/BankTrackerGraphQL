import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-configurator',
  imports: [MatTableModule, MatCardModule, MatButtonModule, MatIconModule, DatePipe, CurrencyPipe],
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
      recurring: true,
      amount: 10,
      currency: 'EUR',
      date: new Date(),
    },
    {
      name: 'Sample Configuration',
      description: 'This is a sample configuration for demonstration purposes.',
      recurring: false,
      amount: 20,
      currency: 'USD',
      date: new Date(),
    },
    {
      name: 'Sample Configuration',
      description: 'This is a sample configuration for demonstration purposes.',
      recurring: true,
      amount: 30,
      currency: 'USD',
      date: new Date(),
    },
    {
      name: 'Sample Configuration',
      description: 'This is a sample configuration for demonstration purposes.',
      recurring: false,
      amount: 40,
      currency: 'USD',
      date: new Date(),
    },
    {
      name: 'Sample Configuration',
      description: 'This is a sample configuration for demonstration purposes.',
      recurring: true,
      amount: 50,
      currency: 'USD',
      date: new Date(),
    },
  ]);

  displayedColumns: string[] = ['name', 'description', 'recurring', 'amount', 'date'];

  async onCreateClicked(): Promise<void> {
    await this.router.navigate(['/config/create']);
  }
}

export default ConfiguratorComponent;
