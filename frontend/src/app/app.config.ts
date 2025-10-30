import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, inject, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    importProvidersFrom(MatSnackBarModule),
    provideRouter(routes), provideHttpClient(), provideApollo(() => {
      const httpLink = inject(HttpLink);

      const authLink = setContext((_, { headers }) => {
        const token = localStorage.getItem('auth_token');
        return {
          headers: {
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        } as Record<string, unknown>;
      });

      return {
        link: ApolloLink.from([
          authLink,
          httpLink.create({ uri: environment.graphqlUri })
        ]),
        cache: new InMemoryCache(),
      };
    })
  ]
};
