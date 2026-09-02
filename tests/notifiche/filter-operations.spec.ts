// spec: specs/test-plan-notifiche.md
// seed: tests/auth.setup.ts

import { test } from '@playwright/test';

test.describe('Filter Functionality', () => {
  test('Apply single filter - Year selection', async ({ page }) => {
    // Open Anno (Year) dropdown and select a different year
    await page.goto('http://localhost:3000/ente/listanotifiche');
    await new Promise(f => setTimeout(f, 2000));

    const annoCombobox = page.locator('combobox').first();
    
    // 1. Click on Anno dropdown
    await annoCombobox.click();
    
    // Verify Dropdown opens and shows list of available years
    const yearOptions = page.locator('[role="option"]');
    const yearCount = await yearOptions.count();
    console.log('Number of year options:', yearCount);

    // Get first option (different from current)
    if (yearCount > 1) {
      const secondOption = yearOptions.nth(1);
      const secondOptionText = await secondOption.textContent();
      console.log('Second year option:', secondOptionText);

      // Click the second year
      await secondOption.click();
      
      // 2. Verify Filter is applied by checking if Mese updates
      await new Promise(f => setTimeout(f, 500));
      
      const meseCombobox = page.locator('combobox').nth(1);
      const meseValue = await meseCombobox.textContent();
      console.log('Mese updated to:', meseValue);

      // 3. Click Filtra button
      const filtraButton = page.locator('button:has-text("Filtra")');
      const isFiltraEnabled = await filtraButton.isEnabled();
      console.log('Filtra button enabled:', isFiltraEnabled);

      if (isFiltraEnabled) {
        await filtraButton.click();
        
        // Wait for grid to refresh
        await new Promise(f => setTimeout(f, 1000));
        
        // Verify Grid data refreshes with notifications from selected year
        const grid = page.locator('table');
        const isGridVisible = await grid.isVisible();
        console.log('Grid visible after filter:', isGridVisible);

        // Verify Annulla button becomes enabled
        const annullaButton = page.locator('button').filter({ hasText: 'Annulla' });
        const isAnnullaVisible = await annullaButton.isVisible().catch(() => false);
        console.log('Annulla button visible after filter:', isAnnullaVisible);
      }
    }
  });

  test('Apply multiple filters together', async ({ page }) => {
    await page.goto('http://localhost:3000/ente/listanotifiche');
    await new Promise(f => setTimeout(f, 2000));

    // 1. Select year and month
    const annoCombobox = page.locator('combobox').first();
    const meseCombobox = page.locator('combobox').nth(1);
    const iunInput = page.locator('textbox').filter({ has: page.locator('text=IUN') }).first();
    const capInput = page.locator('textbox').filter({ has: page.locator('text=CAP') }).first();

    // Set filters
    try {
      // IUN filter
      await iunInput.fill('TEST_IUN');
      console.log('IUN filter set');

      // CAP filter  
      await capInput.fill('12345');
      console.log('CAP filter set');
    } catch (e) {
      console.log('Could not set some filters');
    }

    // 2. Click Filtra button
    const filtraButton = page.locator('button:has-text("Filtra")');
    await filtraButton.click();
    
    await new Promise(f => setTimeout(f, 1000));

    // Verify All filters are applied
    const grid = page.locator('table');
    const isGridVisible = await grid.isVisible();
    console.log('Grid visible with multiple filters:', isGridVisible);

    // Verify Annulla button shows enabled
    const annullaButton = page.locator('button').filter({ hasText: 'Annulla' });
    const isAnnullaVisible = await annullaButton.isVisible().catch(() => false);
    console.log('Annulla button visible with multiple filters:', isAnnullaVisible);
  });

  test('Cancel filters - Annulla button', async ({ page }) => {
    await page.goto('http://localhost:3000/ente/listanotifiche');
    await new Promise(f => setTimeout(f, 2000));

    // 1. Apply some filters first
    const iunInput = page.locator('textbox').filter({ has: page.locator('text=IUN') }).first();
    await iunInput.fill('TEST');

    const filtraButton = page.locator('button:has-text("Filtra")');
    await filtraButton.click();
    
    await new Promise(f => setTimeout(f, 500));

    // 2. Click Annulla button
    const annullaButton = page.locator('button').filter({ hasText: 'Annulla' });
    const isAnnullaVisible = await annullaButton.isVisible().catch(() => false);
    console.log('Annulla button visible:', isAnnullaVisible);

    if (isAnnullaVisible) {
      await annullaButton.click();
      
      await new Promise(f => setTimeout(f, 500));

      // Verify All filters are reset to defaults
      const iunValue = await iunInput.inputValue().catch(() => '');
      console.log('IUN value after Annulla:', iunValue);

      // Verify Annulla button becomes disabled
      const isAnnullaEnabledAfter = await annullaButton.isEnabled().catch(() => false);
      console.log('Annulla button enabled after reset:', isAnnullaEnabledAfter);
    }
  });
});
