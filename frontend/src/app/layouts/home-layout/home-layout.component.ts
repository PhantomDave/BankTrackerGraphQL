import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home-layout',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class HomeLayoutComponent {}
