import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';

import { FlexComponent } from '../../ui-library/flex-component/flex-component';

@Component({
  selector: 'app-welcome-layout-component',
  imports: [
    FlexComponent,
    MatCard,
    MatButton,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardImage,
    MatCardActions,
    NgOptimizedImage,
    MatCardContent,
  ],
  templateUrl: './welcome-layout-component.html',
  styleUrl: './welcome-layout-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeLayoutComponent {
  title = input<string>('Welcome Layout');
  subtitle = input<string>('Welcome Layout Subtitle');

  image = input<WelcomeLayoutImage | undefined>(undefined);
  actions = input<WelcomeLayoutActions[]>([]);
}

export interface WelcomeLayoutImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface WelcomeLayoutActions {
  text: string;
  action: () => void;
}
