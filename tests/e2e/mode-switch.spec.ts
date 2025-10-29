import { expect, test } from '@playwright/test';
import { MODE_ASSETS, MODE_CONFIG, MODE_LIST } from '../../app/workspace/components/canvas/modeConfig';
import { deriveModeTheme } from '../../app/workspace/components/canvas/utils/themeUtils';

const getAccentHex = async (page: import('@playwright/test').Page) => {
  return page.evaluate(() => {
    const root = document.querySelector("[data-workspace-root]") as HTMLElement | null;
    if (!root) return "";
    return getComputedStyle(root).getPropertyValue("--mode-accent-hex").trim().toLowerCase();
  });
};

const getSidebarBg = async (page: import('@playwright/test').Page) => {
  return page.evaluate(() => {
    const root = document.querySelector("[data-workspace-root]") as HTMLElement | null;
    if (!root) return "";
    return getComputedStyle(root).getPropertyValue("--mode-sidebar-bg").trim();
  });
};

test.describe('Mode switch theming', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
  });

  for (const mode of MODE_LIST) {
    const label = MODE_CONFIG[mode]?.label ?? mode;
    const assets = MODE_ASSETS[mode] ?? {};
    const expectedAccent = (assets.accent ?? '#6366f1').toLowerCase();
    const theme = deriveModeTheme(assets.accent ?? '#6366F1');

    test(`applies ${label} theme variables`, async ({ page }) => {
      const button = page.locator(`button[data-mode="${mode}"]`);
      await expect(button, `${label} mode button should be visible`).toBeVisible();

      await button.click();

      await expect.poll(() => getAccentHex(page)).toBe(expectedAccent);
      await expect.poll(() => getSidebarBg(page)).toBe(theme.sidebarBg);
    });
  }
});
