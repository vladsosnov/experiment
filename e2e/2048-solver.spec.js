import { expect, test } from '@playwright/test';

const MIRRORED_BOARD = [
  1024, 512, 256, 128,
  64, 32, 16, 8,
  4, 0, 2, 0,
  0, 0, 0, 0,
];

const RISKY_2048_BOARD = [
  1024, 1024, 0, 0,
  2, 4, 8, 16,
  4, 8, 16, 32,
  8, 16, 32, 64,
];

async function fillBoard(page, values) {
  for (const [index, value] of values.entries()) {
    if (!value) continue;
    const row = Math.floor(index / 4) + 1;
    const column = (index % 4) + 1;
    await page.getByLabel(`Row ${row} column ${column}`).fill(String(value));
  }
}

test('player can mirror a phone board and apply the suggested move', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /2048 solver/i }).click();

  await expect(page.getByRole('heading', { name: 'Move Solver' })).toBeVisible();
  await page.getByRole('button', { name: 'Fast' }).click();
  await fillBoard(page, MIRRORED_BOARD);

  await expect(page.getByTestId('recommended-move')).toContainText('Left');
  await expect(page.getByRole('button', { name: 'Left' })).toHaveClass(/recommended/);

  await page.getByRole('button', { name: 'Left' }).click();
  await expect(page.getByLabel('Row 3 column 1')).toHaveValue('4');
  await expect(page.getByLabel('Row 3 column 2')).toHaveValue('2');
  await expect(page.getByLabel('Row 3 column 3')).toHaveValue('');
  await expect(page.getByTestId('recommended-move')).toContainText('Add spawned tile');
  await expect(page.getByRole('button', { name: 'Left' })).toBeDisabled();
  await page.getByRole('button', { name: 'Classic' }).click();
  await expect(page.getByTestId('recommended-move')).toContainText('Add spawned tile');
  await page.getByRole('button', { name: 'Max points' }).click();
  await expect(page.getByTestId('recommended-move')).toContainText('Add spawned tile');

  await page.getByLabel('Row 4 column 4').fill('2');
  await expect(page.getByTestId('recommended-move')).not.toContainText('Add spawned tile');
  await expect(page.getByTestId('recommended-move')).toContainText('Confidence');

  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(page.getByLabel('Row 1 column 1')).toHaveValue('');
  await expect(page.getByTestId('recommended-move')).toContainText('No legal move');

  await fillBoard(page, RISKY_2048_BOARD);
  await expect(page.getByTestId('recommended-move')).toContainText('Up');
  await expect(page.getByRole('button', { name: 'Left' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Right' })).toBeDisabled();
});
