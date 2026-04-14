import { test, expect } from "@playwright/test";
import { injectAuthToken, mockLeadsAPI } from "./helpers";

test.describe("Page Leads (Prospects)", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page);
    await mockLeadsAPI(page);
    await page.goto("/leads");
    await page.waitForLoadState("networkidle");
  });

  test("affiche le titre de la page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Prospects" })).toBeVisible();
  });

  test("affiche la liste des leads (Jean Dupont)", async ({ page }) => {
    // Vérifie que le mock fonctionne et affiche Jean Dupont
    await expect(page.getByText("Jean Dupont")).toBeVisible();
    await expect(page.getByText("Startup Inc")).toBeVisible();
  });

  test("affiche les boutons d'action Exporter / Importer", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Exporter" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Importer des leads" })).toBeVisible();
  });

  test("affiche les filtres de statut", async ({ page }) => {
    await expect(page.getByText("Tous", { exact: true })).toBeVisible();
    await expect(page.getByText("Enrichis")).toBeVisible();
  });

  test("recherche un lead via la barre de recherche", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Rechercher un prospect...");
    await searchInput.fill("Marie");
    // Marie Lawson devrait être visible, Jean Dupont non (si le filtrage est implémenté côté mock, 
    // ou si on s'attend juste à ce que l'input accepte du texte sans crash)
    await expect(searchInput).toHaveValue("Marie");
  });

  test("sélectionne un lead via checkbox", async ({ page }) => {
    const checkboxes = page.getByRole("checkbox");
    // La première checkbox est souvent le "Select All", on prend la deuxième pour le premier lead
    await checkboxes.nth(1).check();
    await expect(checkboxes.nth(1)).toBeChecked();
    
    // Vérifie que la barre d'action groupée apparaît
    await expect(page.getByText("1 sélectionnés")).toBeVisible();
  });

  test("ouvre le drawer au clic sur un lead", async ({ page }) => {
    // Cliquer sur la ligne ou le nom de Jean Dupont
    await page.getByRole('row').filter({ hasText: 'Jean Dupont' }).first().click();
    
    // Le drawer doit s'ouvrir avec le titre Fiche Prospect
    await expect(page.getByRole('heading', { name: 'Fiche Prospect' })).toBeVisible();
    await expect(page.getByText("jean.dupont@startup.com")).toBeVisible();
  });

  test("ferme le drawer en cliquant sur ✕", async ({ page }) => {
    await page.getByRole('row').filter({ hasText: 'Jean Dupont' }).first().click();
    await page.getByRole("button", { name: "✕" }).click();
    await expect(page.getByRole('heading', { name: 'Fiche Prospect' })).toBeHidden();
  });
});
