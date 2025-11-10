import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import {
    ApplicationConfig, importProvidersFrom, inject, provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection
} from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { ApolloLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';

import { environment } from './environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    importProvidersFrom(MatSnackBarModule),
    provideRouter(routes),
    provideHttpClient(),
    provideApollo(() => {
      const httpLink = inject(HttpLink);

      const authLink = new SetContextLink((prevContext, _operation) => {
        const prev = prevContext?.headers;
        let headers = prev instanceof HttpHeaders ? prev : new HttpHeaders(prev ?? {});
        const token = localStorage.getItem('sessionData');
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return { headers };
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
