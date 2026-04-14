import { test, expect } from "@playwright/test";
import { injectAuthToken } from "./helpers";

test.describe("Navigation sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page);
    // /pipeline n'a aucun appel API — parfait pour tester la sidebar seule
    await page.goto("/pipeline");
    // Attendre que la sidebar soit hydratée
    await page.waitForLoadState("networkidle");
  });

  test("affiche le logo Uprising dans la sidebar", async ({ page }) => {
    // Le texte "Uprising" est dans le lien du logo dans la sidebar
    await expect(page.locator("aside").getByText("Uprising")).toBeVisible({ timeout: 8000 });
  });

  test("affiche le lien Leads dans la sidebar", async ({ page }) => {
    await expect(page.locator("aside").getByRole("link", { name: "Leads" })).toBeVisible({ timeout: 8000 });
  });

  test("navigue vers /campaigns via la sidebar", async ({ page }) => {
    await page.locator("aside").getByRole("link", { name: "Campaigns" }).click();
    await expect(page).toHaveURL("/campaigns");
    await expect(page.getByText("SaaS Outreach Q2")).toBeVisible();
  });

  test("navigue vers /pipeline via la sidebar", async ({ page }) => {
    // Déjà sur /pipeline — on re-clique pour confirmer que le lien fonctionne
    await page.locator("aside").getByRole("link", { name: "Pipeline" }).click();
    await expect(page).toHaveURL("/pipeline");
    await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
  });

  test("le bouton collapse masque le texte de navigation", async ({ page }) => {
    // La sidebar est expanded — "Uprising" visible
    await expect(page.locator("aside").getByText("Uprising")).toBeVisible({ timeout: 8000 });

    // Click sur le toggle (premier bouton de la sidebar)
    await page.locator("aside").locator("button").first().click();

    // Après collapse, "Uprising" doit disparaître (motion.div width:0)
    await expect(page.locator("aside").getByText("Uprising")).toBeHidden({ timeout: 3000 });
  });

  test("affiche les items récents dans la sidebar", async ({ page }) => {
    await expect(page.getByText("Prospection Montréal PME")).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("Campagne agences web Q2")).toBeVisible();
  });

  test("affiche le profil utilisateur en bas de sidebar", async ({ page }) => {
    await expect(page.locator("aside").getByText("Kael")).toBeVisible({ timeout: 8000 });
    await expect(page.locator("aside").getByText("Forfait Pro")).toBeVisible();
  });
});
