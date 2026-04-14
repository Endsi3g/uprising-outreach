import { test, expect } from "@playwright/test";
import { injectAuthToken, mockLeadsAPI } from "./helpers";

test.describe("Page Leads (Prospects)", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page);
    await mockLeadsAPI(page);
    await page.goto("/leads");
  });

  test("affiche le titre de la page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Prospects" })).toBeVisible();
  });

  test("affiche la description de la page", async ({ page }) => {
    await expect(
      page.getByText("Gérez votre base de données de leads")
    ).toBeVisible();
  });

  test("affiche les boutons d'action Exporter / Importer", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Exporter" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Importer des leads" })).toBeVisible();
  });

  test("affiche les filtres de statut", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Tous/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Bruts/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Enrichis/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Scoring IA/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Réponses/ })).toBeVisible();
  });

  test("affiche la barre de recherche", async ({ page }) => {
    await expect(
      page.getByPlaceholder("Rechercher un prospect...")
    ).toBeVisible();
  });

  test("les filtres de statut sont cliquables", async ({ page }) => {
    const bruts = page.getByRole("button", { name: /Bruts/ });
    await bruts.click();
    // Après clic, le filtre actif change — l'URL ne change pas mais le state oui
    // On vérifie juste que le clic ne cause pas d'erreur JS
    await expect(bruts).toBeVisible();
  });

  test("affiche les leads du mock API", async ({ page }) => {
    // Attend que les données apparaissent (les leads mockés)
    await expect(page.getByText("Sophie Martin")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Luc Tremblay")).toBeVisible({ timeout: 5000 });
  });

  test("ouvre le drawer au clic sur un lead", async ({ page }) => {
    await page.getByText("Sophie Martin").click();
    // Le drawer s'ouvre avec la fiche prospect
    await expect(page.getByText("Fiche Prospect")).toBeVisible({ timeout: 3000 });
    await expect(page.getByText("Agence Web MTL")).toBeVisible();
  });

  test("ferme le drawer avec le bouton ✕", async ({ page }) => {
    await page.getByText("Sophie Martin").click();
    await expect(page.getByText("Fiche Prospect")).toBeVisible();

    // Clic sur le ✕ du drawer
    await page.getByText("Fiche Prospect")
      .locator("xpath=../../..")
      .getByRole("button", { name: "✕" }).click();

    await expect(page.getByText("Fiche Prospect")).toBeHidden({ timeout: 2000 });
  });
});
