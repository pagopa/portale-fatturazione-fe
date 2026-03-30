import { expect, Page } from '@playwright/test';

type Filter = {
  name: string;
  label: string;
  valueToSelect?:string
};

export async function checkFilter(page: Page, filter: Filter) {
  const id = `filter_${filter.name}`;

  const formControl = page.locator(`div#${id}`);
  await expect(formControl).toBeVisible();
  await expect(formControl).toHaveCount(1);

  const label = formControl.locator('label');
  await expect(label).toHaveText(filter.label);
  /*if(filter.name === "anno"){
      await formControl.click();

      // Select a value different from 9999 (e.g. 2024)
      const option = page.locator('li', { hasText: '2023' });
      console.log({option})
      await option.click();
      const annullaButton = page.locator('button', { hasText: 'Annulla Filtri' });

      await expect(annullaButton).toBeVisible();
  }*/
}

export async function checkAutocomplete(page: Page, filter: Filter) {
  const id = `filter_${filter.name}`;
  // 1️⃣ Locate container by id
   const label = page.locator(`label[id="${id}-label"]`);
  await expect(label).toHaveText(filter.label);

  /* 3️⃣ Optionally select a value
  if (valueToSelect) {
    await input.click(); // open dropdown
    const option = page.locator('li', { hasText: valueToSelect });
    await expect(option).toBeVisible();
    await option.click();
    // confirm the input now has the value
    await expect(input).toHaveValue(valueToSelect);
  }*/
}
