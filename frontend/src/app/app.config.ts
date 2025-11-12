import { provideApollo } from 'apollo-angular';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideRouter } from '@angular/router';
import { ApolloLink, InMemoryCache } from '@apollo/client';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { SetContextLink } from '@apollo/client/link/context';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { unauthorizedInterceptor } from './interceptor/unauthorized-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    importProvidersFrom(MatSnackBarModule),
    provideNativeDateAdapter(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([unauthorizedInterceptor])),
    provideApollo(() => {
      const authLink = new SetContextLink((prevContext: { [key: string]: unknown }, _operation) => {
        const prevHeaders = (prevContext?.['headers'] as Record<string, string> | undefined) ?? {};
        const headers: Record<string, string> = { ...prevHeaders };

        const sessionRaw = localStorage.getItem('sessionData');
        if (sessionRaw) {
          try {
            const session = JSON.parse(sessionRaw) as { token?: string };
            if (session?.token) {
              headers['Authorization'] = `Bearer ${session.token}`;
            }
          } catch {
            localStorage.removeItem('sessionData');
          }
        }
        // HotChocolate requires this header on multipart requests (HC0077)
        // See: https://chillicream.com/docs/hotchocolate/v15/server/files#client-usage
        headers['GraphQL-Preflight'] = '1';

        // Keep Apollo preflight to force a CORS preflight in browsers (harmless on non-multipart)
        headers['Apollo-Require-Preflight'] = 'true';

        return { headers };
      });

      // Use UploadHttpLink to support GraphQL multipart requests for file uploads
      const uploadLink = new UploadHttpLink({ uri: environment.graphqlUri });

      return {
        link: ApolloLink.from([authLink, uploadLink]),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
