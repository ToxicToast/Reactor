import { test, expect } from '@playwright/test';

test('renders the foodfolio shell', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1')).toHaveText('Foodfolio');
});
