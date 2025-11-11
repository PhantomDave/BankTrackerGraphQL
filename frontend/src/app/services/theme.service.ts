import { Injectable, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly THEME_KEY = 'app-theme';

  readonly isDarkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const darkMode = this.isDarkMode();
      this.applyTheme(darkMode);
    });
  }

  toggleTheme(): void {
    this.isDarkMode.update((current) => !current);
    localStorage.setItem(this.THEME_KEY, this.isDarkMode() ? 'dark' : 'light');
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem(this.THEME_KEY);
    if (stored) {
      return stored === 'dark';
    }
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean): void {
    const body = this.document.body;
    if (isDark) {
      body.style.colorScheme = 'dark';
    } else {
      body.style.colorScheme = 'light';
    }
  }
}
