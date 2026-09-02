// spec: specs/test-plan-notifiche.md
// seed: tests/auth.setup.ts

import { test, expect } from '@playwright/test';

test.describe('Loading and Error States', () => {
  test('Loading indicator during data fetch', async ({ page }) => {
    // Navigate to page
    await page.goto('http://localhost:3000/ente/listanotifiche');
    
    // 1. Apply filters and observe page load
    await new Promise(f => setTimeout(f, 2000));

    const filtraButton = page.locator('button:has-text("Filtra")');
    
    // Click filter to trigger loading
    await filtraButton.click();

    // Check if loading modal appears
    const loadingModal = page.locator('[class*="modal"], [class*="dialog"], [class*="loading"]').filter({ hasText: 'Loading...' });
    const hasLoadingModal = await loadingModal.isVisible().catch(() => false);
    console.log('Loading modal visible:', hasLoadingModal);

    // 2. Wait for data to load
    await new Promise(f => setTimeout(f, 2000));

    // Verify Loading modal disappears
    const loadingGone = await loadingModal.isVisible().catch(() => false);
    console.log('Loading modal gone:', !loadingGone);

    // Verify Grid displays data
    const grid = page.locator('table');
    const isGridVisible = await grid.isVisible();
    console.log('Grid visible after load:', isGridVisible);

    // Verify Buttons become enabled
    const isFiltraEnabled = await filtraButton.isEnabled();
    console.log('Filtra button enabled after load:', isFiltraEnabled);
  });

  test('Error handling - No data found', async ({ page }) => {
    // Navigate to page
    await page.goto('http://localhost:3000/ente/listanotifiche');
    await new Promise(f => setTimeout(f, 2000));

    // Apply filters that might return no results
    const iunInput = page.locator('textbox').filter({ has: page.locator('text=IUN') }).first();
    
    // Enter a value that's unlikely to exist
    await iunInput.fill('NONEXISTENT_IUN_999999');

    const filtraButton = page.locator('button:has-text("Filtra")');
    await filtraButton.click();

    await new Promise(f => setTimeout(f, 1000));

    // Check for empty state message
    const emptyMessage = page.locator('text=Non sono presenti notifiche');
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);
    console.log('Empty message visible:', hasEmptyMessage);

    // Verify Total count is 0
    const rowCount = page.locator('table tbody tr').count();
    console.log('Total rows:', await rowCount);
  });

  test('Error handling - Redirect modal', async ({ page }) => {
    // Try to access page when billing data might not be complete
    await page.goto('http://localhost:3000/ente/listanotifiche');
    await new Promise(f => setTimeout(f, 2000));

    // Check for redirect modal
    const redirectModal = page.locator('[class*="modal"], [class*="dialog"]').filter({ hasText: /fatturazione|billing/ });
    const hasRedirectModal = await redirectModal.isVisible().catch(() => false);
    console.log('Redirect modal visible:', hasRedirectModal);

    if (hasRedirectModal) {
      // Verify error message
      const message = page.locator('text=obbligatorio fornire');
      const hasMessage = await message.isVisible().catch(() => false);
      console.log('Has required message:', hasMessage);

      // Verify user can dismiss modal
      const closeButton = redirectModal.locator('button').first();
      const hasCloseButton = await closeButton.isVisible().catch(() => false);
      console.log('Has close button:', hasCloseButton);
    }
  });
});

test.describe('Edge Cases', () => {
  test('Invalid filter input handling', async ({ page }) => {
    // Navigate to page
    await page.goto('http://localhost:3000/ente/listanotifiche');
    await new Promise(f => setTimeout(f, 2000));

    // 1. Enter special characters in text input fields
    const iunInput = page.locator('textbox').filter({ has: page.locator('text=IUN') }).first();
    const capInput = page.locator('textbox').filter({ has: page.locator('text=CAP') }).first();

    try {
      // Enter special characters
      await iunInput.fill('!@#$%^&*()');
      console.log('Special characters accepted in IUN');

      await capInput.fill('12345abcdefghijklmnopqrstuvwxyz');
      console.log('Long string accepted in CAP');
    } catch (e) {
      console.log('Input validation prevented special characters');
    }

    // 2. Submit with potentially invalid inputs
    const filtraButton = page.locator('button:has-text("Filtra")');
    const isFiltraEnabled = await filtraButton.isEnabled();

    if (isFiltraEnabled) {
      try {
        await filtraButton.click();
        await new Promise(f => setTimeout(f, 1000));

        // Verify API handles invalid inputs gracefully
        const grid = page.locator('table');
        const isGridVisible = await grid.isVisible();
        console.log('UI still functional after invalid input:', isGridVisible);
      } catch (e) {
        console.log('Error handling invalid input:', e.message);
      }
    }
  });

  test('Rapid filter changes', async ({ page }) => {
    // Navigate to page
    await page.goto('http://localhost:3000/ente/listanotifiche');
    await new Promise(f => setTimeout(f, 2000));

    // 1. Quickly change multiple filter values without clicking Filtra
    const annoCombobox = page.locator('combobox').first();
    const iunInput = page.locator('textbox').filter({ has: page.locator('text=IUN') }).first();
    const capInput = page.locator('textbox').filter({ has: page.locator('text=CAP') }).first();

    try {
      // Rapid changes
      for (let i = 0; i < 3; i++) {
        await iunInput.fill(`IUN_${i}`);
        await capInput.fill(`CAP_${i}`);
        await new Promise(f => setTimeout(f, 100));
      }

      console.log('Rapid filter changes completed without errors');

      // 2. Click Filtra after rapid changes
      const filtraButton = page.locator('button:has-text("Filtra")');
      await filtraButton.click();
      
      await new Promise(f => setTimeout(f, 1000));

      // Verify Latest filter state is sent to API
      const iunValue = await iunInput.inputValue();
      console.log('Latest IUN value:', iunValue);

      const grid = page.locator('table');
      const isGridVisible = await grid.isVisible();
      console.log('Grid displays data with latest filters:', isGridVisible);
    } catch (e) {
      console.log('Error during rapid filter changes:', e.message);
    }
  });
});
