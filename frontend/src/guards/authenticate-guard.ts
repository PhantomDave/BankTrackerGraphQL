import { CanActivateFn } from '@angular/router';

export const authenticateGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('auth_token');
  return token !== null;
};
