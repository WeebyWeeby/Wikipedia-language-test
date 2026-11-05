import { expect, test, type Page } from '@playwright/test';

declare const process: { env: Record<string, string | undefined> };

const wikiHome = 'https://en.wikipedia.org/wiki/Main_Page';
const wikiLogin = process.env.WIKIPEDIA_USERNAME;
const wikiPass = process.env.WIKIPEDIA_PASSWORD;
const cyrillicText = /\p{Script=Cyrillic}/u;

async function expectUkrainianInterface(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await expect(page.getByRole('searchbox')).toHaveAccessibleName(cyrillicText);
  await expect(page.getByRole('search').getByRole('button')).toHaveAccessibleName(cyrillicText);
  await expect(page.getByRole('banner').getByRole('button').first()).toHaveAccessibleName(cyrillicText);
}

async function expectLocalizedPreferencesLink(page: Page) {
  const userMenuToggle = page.locator('#vector-user-links-dropdown-checkbox');
  await userMenuToggle.check();
  await expect(userMenuToggle).toBeChecked();

  const preferencesLink = page.locator('#pt-preferences').getByRole('link');
  await expect(preferencesLink).toBeVisible();
  await expect(preferencesLink).toHaveAccessibleName(cyrillicText);
}

test('Wikipedia EN interface language can be changed to Ukrainian and persists after reopening', async ({
  page,
  browser,
}) => {
  test.skip(
    !wikiLogin || !wikiPass,
    'Set WIKIPEDIA_USERNAME and WIKIPEDIA_PASSWORD in the environment!!!',
  );

  await page.goto(wikiHome, { waitUntil: 'domcontentloaded' });

  const userMenu = page.locator('#vector-user-links-dropdown.vector-user-menu-logged-in');
  if (!(await userMenu.isVisible())) {
    await page.getByRole('link', { name: /log in/i }).click();
    await page.getByRole('textbox', { name: /username/i }).fill(wikiLogin!);
    await page.getByRole('textbox', { name: /password/i }).fill(wikiPass!);
    await page.getByRole('button', { name: /log in/i }).click();
  }

  await expect(userMenu).toBeVisible();
  await userMenu.locator('#vector-user-links-dropdown-checkbox').check();

  const preferencesLink = page.locator('#pt-preferences').getByRole('link');
  await expect(preferencesLink).toBeVisible();
  await preferencesLink.press('Enter');
  await expect(page).toHaveURL(/Special:Preferences/i);

  const internationalisationGroup = page.getByRole('group', {
    name: 'Internationalisation',
  });
  const languageSelect = page.locator('#mw-htmlform-i18n select[name="wplanguage"]');
  await expect(languageSelect).toBeAttached();
  await expect(languageSelect.locator('option[value="uk"]')).toHaveCount(1);

  const languageInput = internationalisationGroup.locator(
    '.mw-widgets-languageSelectWidget-vue-container input[role="combobox"]',
  );
  await expect(languageInput).toBeVisible();
  await languageInput.fill('українська');
  const ukrainianOption = internationalisationGroup.getByRole('option', {
    name: /^uk\s*·\s*українська$/i,
  });
  await expect(ukrainianOption).toBeVisible();
  await ukrainianOption.click();
  await expect(languageSelect).toHaveValue('uk');

  await page.locator('#prefcontrol').getByRole('button').click();
  await expect(page).toHaveURL(/Special:Preferences/i);
  await expect(languageSelect).toHaveValue('uk');

  await page.goto(wikiHome, { waitUntil: 'domcontentloaded' });
  await expectUkrainianInterface(page);
  await expectLocalizedPreferencesLink(page);

  const savedStorageState = await page.context().storageState();
  await page.close();

  const reopenedContext = await browser.newContext({ storageState: savedStorageState });
  try {
    const reopenedPage = await reopenedContext.newPage();
    await reopenedPage.goto(wikiHome, { waitUntil: 'domcontentloaded' });
    await expectUkrainianInterface(reopenedPage);
    await expectLocalizedPreferencesLink(reopenedPage);
  } finally {
    await reopenedContext.close();
  }
});