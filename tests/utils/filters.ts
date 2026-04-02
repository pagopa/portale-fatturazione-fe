import { expect, Locator, Page } from "@playwright/test";

type Filter = {
  name: string;
  label: string;
  valueToSelect?: string;
};

export async function checkFilter(page: Page, filter: Filter) {
  const id = `filter_${filter.name}`;

  const formControl = page.locator(`div#${id}`);
  await expect(formControl).toBeVisible();
  await expect(formControl).toHaveCount(1);

  const label = formControl.locator("label");
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
}

export async function testSortFilter({
  page,
  table,
  grid,
  pagination,
  columnName,
  expectedValues,
  hasText
}: {
  page:Page
  table: any;
  grid: Locator;
  pagination: Locator;
  columnName: string;
  expectedValues: [string, string, string,string];
  hasText?: string;
}) {

  await expect(table).toBeVisible();
  const header = table.getByRole("columnheader", { name: columnName });
  await expect(header).toHaveCount(1);
  const button = header.locator("button");

  const nextPageButton = pagination.getByRole("button", {
    name: "Go to next page",
  });

  const prevPageButton = pagination.getByRole("button", {
    name: "Go to previous page",
  });

  const getFirstRow = grid.locator("> tr:visible").filter({ hasText: hasText ? hasText :"Emessa" }).first();
  console.log(await button.innerText())
  // 🔹 click ASC
  await button.click();
 
  await expect(getFirstRow).toContainText(expectedValues[0]);

  // 🔹 click DESC
  await button.click();
  await expect(getFirstRow).toContainText(expectedValues[1]);

  // 🔹 click RESET (if applicable)
  await button.click();
  await expect(getFirstRow).toContainText(expectedValues[0]);

  // 🔹 pagination checks
  await expect(prevPageButton).toBeDisabled();
  await expect(nextPageButton).toBeEnabled();

  await nextPageButton.click();
  await expect(getFirstRow).toContainText(expectedValues[3]);

  await expect(prevPageButton).toBeEnabled();
}
