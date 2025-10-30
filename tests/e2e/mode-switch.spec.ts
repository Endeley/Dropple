import { expect, test } from '@playwright/test';
import { MODE_ASSETS, MODE_CONFIG, MODE_LIST } from '../../app/workspace/components/canvas/modeConfig';
import { deriveModeTheme } from '../../app/workspace/components/canvas/utils/themeUtils';

test.describe('Mode switch theming', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage?.removeItem('dropple-canvas-state');
      } catch (error) {
        console.warn('Failed to clear persisted canvas state', error);
      }
    });
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
  });

  for (const mode of MODE_LIST) {
    const label = MODE_CONFIG[mode]?.label ?? mode;
    const assets = MODE_ASSETS[mode] ?? {};
    const expectedAccent = (assets.accent ?? '#6366f1').toLowerCase();
    const theme = deriveModeTheme(assets.accent ?? '#6366F1');

    test(`applies ${label} theme variables`, async ({ page }) => {
      const root = page.locator('[data-workspace-root]');
      const button = page.locator(`button[data-mode="${mode}"]`);
      await expect(button, `${label} mode button should be visible`).toBeVisible();

      await button.click();

      await expect(root).toHaveAttribute('data-mode', mode);
      await expect(root).toHaveAttribute('data-accent-hex', expectedAccent);
      await expect.poll(async () => {
        const raw = await root.evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--mode-sidebar-bg').trim(),
        );
        return raw;
      }).toBe(theme.sidebarBg);
    });
  }
});
