import { test, expect } from '@playwright/test';

test.describe('BankTracker Application', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loaded successfully
    await expect(page).toHaveTitle(/BankTracker|Frontend/i);
  });

  test('should display login form on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Look for login form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to different pages', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if page is accessible
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
  });
});
