import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, inject, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    importProvidersFrom(MatSnackBarModule),
    provideRouter(routes), provideHttpClient(), provideApollo(() => {
      const httpLink = inject(HttpLink);

      return {
        link: httpLink.create({
          uri: environment.graphqlUri,
        }),
        cache: new InMemoryCache(),
      };
    })
  ]
};
