import { test, expect } from '@playwright/test';

test.describe('roulette-web', () => {
  test('shows title and manual entry', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-title')).toContainText(
      'Roulette bias lab',
    );
    await expect(page.getByTestId('no-spins')).toBeVisible();
  });

  test('adds spins and shows statistics', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('pocket-input').fill('7');
    await page.getByTestId('add-spin').click();
    await page.getByTestId('pocket-input').fill('7');
    await page.getByTestId('add-spin').click();
    await page.getByTestId('pocket-input').fill('7');
    await page.getByTestId('add-spin').click();
    await page.getByTestId('pocket-input').fill('12');
    await page.getByTestId('add-spin').click();
    await page.getByTestId('pocket-input').fill('3');
    await page.getByTestId('add-spin').click();
    await expect(page.getByTestId('stats-heading')).toBeVisible();
    await expect(page.getByTestId('bets-heading')).toBeVisible();
    await expect(page.getByTestId('frequency-chart')).toBeVisible();
  });

  test('wheel move distances match European shortest-path examples', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByTestId('pocket-input').fill('0');
    await page.getByTestId('add-spin').click();
    await page.getByTestId('pocket-input').fill('25');
    await page.getByTestId('add-spin').click();
    await page.getByTestId('pocket-input').fill('9');
    await page.getByTestId('add-spin').click();
    await expect(page.getByTestId('wheel-moves-heading')).toBeVisible();
    await expect(page.getByTestId('wheel-move-table')).toBeVisible();
    const moveCells = page.getByTestId('wheel-move-value');
    await expect(moveCells.getByText('7', { exact: true })).toBeVisible();
    await expect(moveCells.getByText('17', { exact: true })).toBeVisible();
  });
});
