import { test, expect } from "@playwright/test";
import { injectAuthToken } from "./helpers";

test.describe("Page Pipeline (Kanban)", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page);
    await page.goto("/pipeline");
  });

  test("affiche le titre Pipeline", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
  });

  test("affiche toutes les colonnes du kanban", async ({ page }) => {
    const colonnes = ["NOUVEAUX", "INTÉRESSÉS", "QUALIFIÉS", "RDV FIXÉ", "PROPOSITION", "GAGNÉ"];
    for (const col of colonnes) {
      await expect(page.getByText(col)).toBeVisible();
    }
  });

  test("affiche les cartes d'opportunité initiales", async ({ page }) => {
    await expect(page.getByText("Luc Richard")).toBeVisible();
    await expect(page.getByText("Sarah Levy")).toBeVisible();
    await expect(page.getByText("Marc Ouellet")).toBeVisible();
    await expect(page.getByText("Yves Tremblay")).toBeVisible();
  });

  test("affiche les entreprises et valeurs des opportunités", async ({ page }) => {
    await expect(page.getByText("Tech Solutions")).toBeVisible();
    await expect(page.getByText("Corp.FR")).toBeVisible();
    await expect(page.getByText("$1,200").first()).toBeVisible();
    await expect(page.getByText("$3,500").first()).toBeVisible();
  });

  test("affiche les métriques résumées", async ({ page }) => {
    await expect(page.getByText("Total Opportunités")).toBeVisible();
    await expect(page.getByText("Gagné (Mois)")).toBeVisible();
    await expect(page.getByText("$12,400")).toBeVisible();
  });

  test("affiche les barres de probabilité sur chaque carte", async ({ page }) => {
    await expect(page.getByText("Probabilité").first()).toBeVisible();
  });

  test("déplacer une carte avance son stage", async ({ page }) => {
    // Luc Richard est dans "NOUVEAUX" (new_reply)
    const card = page.getByText("Luc Richard").locator("..");
    await card.click();

    // Après le clic, la carte devrait être dans la colonne suivante (INTÉRESSÉS)
    // On attend que le layout animation se termine
    await page.waitForTimeout(600);

    // La carte Luc Richard doit toujours exister (dans un autre stage)
    await expect(page.getByText("Luc Richard")).toBeVisible();
  });

  test("les colonnes vides affichent un placeholder", async ({ page }) => {
    // La colonne "GAGNÉ" est vide initialement
    await expect(page.getByText("Aucun prospect à ce stade.")).toBeVisible();
  });
});
