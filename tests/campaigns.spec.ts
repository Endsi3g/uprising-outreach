import { test, expect } from "@playwright/test";
import { injectAuthToken } from "./helpers";

test.describe("Page Campaigns (Séquence Builder)", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page);
    await page.goto("/campaigns");
    await page.waitForLoadState("networkidle");
  });

  test("affiche le nom de la campagne", async ({ page }) => {
    await expect(page.getByText("SaaS Outreach Q2")).toBeVisible();
  });

  test("affiche le badge Draft", async ({ page }) => {
    await expect(page.getByText("Draft")).toBeVisible();
  });

  test("affiche les boutons Sauvegarder et Lancer", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Sauvegarder" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lancer la campagne" })).toBeVisible();
  });

  test("affiche les 3 étapes initiales de la séquence", async ({ page }) => {
    // Les titres d'étapes sont des <input> contrôlés — utiliser getByDisplayValue
    await expect(page.getByDisplayValue("Premier contact")).toBeVisible();
    await expect(page.getByDisplayValue("Pause")).toBeVisible();
    await expect(page.getByDisplayValue("Suivi de valeur")).toBeVisible();
  });

  test("affiche l'indicateur de début de séquence", async ({ page }) => {
    await expect(page.getByText("Début de la séquence")).toBeVisible();
  });

  test("affiche les boutons d'ajout Email et Attente", async ({ page }) => {
    await expect(page.getByRole("button", { name: /\+ Email/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /\+ Attente/ })).toBeVisible();
  });

  test("ajoute une étape Email en cliquant + Email", async ({ page }) => {
    await page.getByRole("button", { name: /\+ Email/ }).click();
    // Le titre de la nouvelle étape est un <input> avec value "Nouvel Email"
    await expect(page.getByDisplayValue("Nouvel Email")).toBeVisible({ timeout: 3000 });
  });

  test("ajoute une étape Attente en cliquant + Attente", async ({ page }) => {
    await page.getByRole("button", { name: /\+ Attente/ }).click();
    await expect(page.getByDisplayValue("Nouvelle Attente")).toBeVisible({ timeout: 3000 });
  });

  test("le nom de campagne est éditable par clic", async ({ page }) => {
    // Cliquer sur le h1 du nom de campagne
    await page.getByText("SaaS Outreach Q2").click();

    // Un input avec la valeur actuelle doit apparaître
    const input = page.getByDisplayValue("SaaS Outreach Q2");
    await expect(input).toBeVisible({ timeout: 2000 });

    // Modifier le nom
    await input.fill("Test Campaign Uprising");
    await input.press("Enter");

    await expect(page.getByText("Test Campaign Uprising")).toBeVisible();
  });

  test("affiche les templates sur les étapes email", async ({ page }) => {
    await expect(page.getByText("SaaS Outreach v1")).toBeVisible();
    await expect(page.getByText("Follow-up - Value prop")).toBeVisible();
  });

  test("les étapes email affichent le label Action: Envoi Email", async ({ page }) => {
    await expect(page.getByText("Action: Envoi Email").first()).toBeVisible();
  });

  test("les étapes wait affichent le label Condition: Délai", async ({ page }) => {
    await expect(page.getByText("Condition: Délai")).toBeVisible();
  });
});
