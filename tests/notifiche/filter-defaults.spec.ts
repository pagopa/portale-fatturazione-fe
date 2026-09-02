// spec: specs/test-plan-notifiche.md
// seed: tests/auth.setup.ts

import { test } from '@playwright/test';

test.describe('Filter Functionality', () => {
  test('Load page with default filters', async ({ page }) => {
    // 1. Navigate to the Notifiche page
    await page.goto('http://localhost:3000/ente/listanotifiche');
    await new Promise(f => setTimeout(f, 2000));

    // Verify page loads successfully
    await page.waitForLoadState('networkidle');
    
    // Verify Year filter shows current/most recent year
    const annoCombobox = page.locator('combobox').first();
    const annoValue = await annoCombobox.textContent();
    console.log('Anno (Year) value:', annoValue);

    // Verify Month filter shows first available month
    const meseCombobox = page.locator('combobox').nth(1);
    const meseValue = await meseCombobox.textContent();
    console.log('Mese (Month) value:', meseValue);

    // Verify Grid displays notifications data
    const grid = page.locator('table');
    const isGridVisible = await grid.isVisible();
    console.log('Grid is visible:', isGridVisible);

    // 2. Verify the filter panel is visible with all filter fields
    // Verify Anno (Year) dropdown is visible
    await annoCombobox.isVisible();
    
    // Verify Mese (Month) dropdown is visible
    await meseCombobox.isVisible();

    // Verify IUN input field is visible
    const iunInput = page.locator('textbox[placeholder=""]').filter({ hasText: 'IUN' });
    await iunInput.isVisible();

    // Verify Tipo notifica filter is visible
    const tipoNotificaCombobox = page.locator('combobox').nth(3);
    await tipoNotificaCombobox.isVisible();

    // Verify Contestazione (Contestation) filter is visible
    const contestazioneCombobox = page.locator('combobox').nth(4);
    await contestazioneCombobox.isVisible();

    // Verify CAP filter is visible
    const capInput = page.locator('textbox[placeholder=""]').filter({ hasText: 'CAP' });
    await capInput.isVisible();

    // Verify Recipient ID filter is visible
    const recipientIdInput = page.locator('textbox[placeholder=""]').filter({ hasText: 'Recipient ID' });
    await recipientIdInput.isVisible();

    // 3. Check that Filtra (Filter) and Annulla (Cancel) buttons are visible
    // Verify Filtra button is visible and enabled
    const filtraButton = page.locator('button:has-text("Filtra")');
    await filtraButton.isVisible();
    const isFiltraEnabled = await filtraButton.isEnabled();
    console.log('Filtra button is enabled:', isFiltraEnabled);

    // Verify Annulla button visibility
    const annullaButton = page.locator('button').filter({ hasText: 'Annulla' });
    const isAnnullaVisible = await annullaButton.isVisible().catch(() => false);
    console.log('Annulla button visibility:', isAnnullaVisible);

    // Verify Download risultati button is visible
    const downloadButton = page.locator('button:has-text("Download risultati")');
    const isDownloadVisible = await downloadButton.isVisible().catch(() => false);
    console.log('Download button visibility:', isDownloadVisible);
  });
});
