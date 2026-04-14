import { test, expect } from "@playwright/test";
import { injectAuthToken, mockLeadsAPI } from "./helpers";

test.describe("Navigation sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page);
    // Mock toutes les routes API pour ne pas bloquer sur le backend
    await page.route("**/leads**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [], total: 0 }) })
    );
    await page.goto("/leads");
  });

  test("affiche le logo Uprising dans la sidebar", async ({ page }) => {
    await expect(page.getByText("Uprising").first()).toBeVisible();
  });

  test("navigue vers /leads et active l'item Leads", async ({ page }) => {
    await expect(page).toHaveURL("/leads");
    // Le lien Leads doit être présent
    await expect(page.getByRole("link", { name: "Leads" })).toBeVisible();
  });

  test("navigue vers /campaigns via la sidebar", async ({ page }) => {
    await page.getByRole("link", { name: "Campaigns" }).click();
    await expect(page).toHaveURL("/campaigns");
    await expect(page.getByText("SaaS Outreach Q2")).toBeVisible();
  });

  test("navigue vers /pipeline via la sidebar", async ({ page }) => {
    await page.getByRole("link", { name: "Pipeline" }).click();
    await expect(page).toHaveURL("/pipeline");
    await expect(page.getByText("Pipeline")).toBeVisible();
  });

  test("le bouton collapse/expand la sidebar", async ({ page }) => {
    // La sidebar est initialement expanded — "Uprising" est visible
    await expect(page.getByText("Uprising").first()).toBeVisible();

    // Click sur le toggle (le bouton avec l'icône de layout)
    const toggle = page.locator("aside button").first();
    await toggle.click();

    // Après collapse, "Uprising" doit disparaître (opacity 0 / width 0)
    await expect(page.getByText("Uprising").first()).toBeHidden({ timeout: 1000 });

    // Re-expand
    await toggle.click();
    await expect(page.getByText("Uprising").first()).toBeVisible();
  });

  test("affiche les items récents dans la sidebar", async ({ page }) => {
    await expect(page.getByText("Prospection Montréal PME")).toBeVisible();
    await expect(page.getByText("Campagne agences web Q2")).toBeVisible();
  });

  test("affiche le profil utilisateur en bas de sidebar", async ({ page }) => {
    await expect(page.getByText("Kael")).toBeVisible();
    await expect(page.getByText("Forfait Pro")).toBeVisible();
  });
});
