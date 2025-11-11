import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

interface GraphQlError {
  message: string;
  extensions?: {
    code?: string;
  };
}

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      // Check if it's a GraphQL error with UNAUTHENTICATED code
      if (error?.error?.errors) {
        const graphqlErrors = error.error.errors as GraphQlError[];
        const hasUnauthenticatedError = graphqlErrors.some(
          (err) => err.extensions?.code === 'UNAUTHENTICATED',
        );

        if (hasUnauthenticatedError) {
          console.error('Unauthorized request intercepted:', req);
          localStorage.removeItem('sessionData');
          inject(Router).navigate(['/login']);
        }
      }

      return throwError(() => error);
    }),
  );
};
