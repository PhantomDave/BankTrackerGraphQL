import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-movements-layout',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class MovementsLayoutComponent {}
