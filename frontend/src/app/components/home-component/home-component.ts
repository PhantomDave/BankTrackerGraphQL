import { Component } from '@angular/core';
import { DashboardComponent } from '../dashboard-component/dashboard-component.component';

@Component({
  selector: 'app-home-component',
  imports: [DashboardComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {}
