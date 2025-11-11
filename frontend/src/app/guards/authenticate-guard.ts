import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AccountService } from '../models/account/account-service';
import { SessionData } from '../models/session-data';

export const authenticateGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const accountService = inject(AccountService);

  const sessionString = localStorage.getItem('sessionData');
  const sessionData: SessionData | null = sessionString
    ? (JSON.parse(sessionString) as SessionData)
    : null;

  if (!sessionData) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const rawLastCheck: unknown = (sessionData as { lastCheck: unknown }).lastCheck;
  const lastCheckMs =
    typeof rawLastCheck === 'number' ? rawLastCheck : Date.parse(String(rawLastCheck));
  const isFresh = Number.isFinite(lastCheckMs) && Date.now() - lastCheckMs <= 30 * 60 * 1000;

  if (sessionData.isValid && isFresh) {
    return true;
  }

  try {
    const isValid = await accountService.verifyToken();

    if (isValid) {
      const updated: SessionData = {
        ...sessionData,
        isValid: true,
        lastCheck: Date.now(),
      };
      localStorage.setItem('sessionData', JSON.stringify(updated));
      return true;
    }

    localStorage.removeItem('sessionData');
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  } catch {
    localStorage.removeItem('sessionData');
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
};
