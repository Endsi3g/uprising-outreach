import { test, expect } from "@playwright/test";
import { injectAuthToken } from "./helpers";

test.describe("Page Campaigns (Séquence Builder)", () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page);
    await page.goto("/campaigns");
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
    await expect(page.getByText("Premier contact")).toBeVisible();
    await expect(page.getByText("Pause")).toBeVisible();
    await expect(page.getByText("Suivi de valeur")).toBeVisible();
  });

  test("affiche l'indicateur de début de séquence", async ({ page }) => {
    await expect(page.getByText("Début de la séquence")).toBeVisible();
  });

  test("affiche les boutons d'ajout Email et Attente", async ({ page }) => {
    await expect(page.getByRole("button", { name: /\+ Email/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /\+ Attente/ })).toBeVisible();
  });

  test("ajoute une étape Email en cliquant + Email", async ({ page }) => {
    const addEmail = page.getByRole("button", { name: /\+ Email/ });
    await addEmail.click();

    // Une nouvelle étape "Nouvel Email" doit apparaître
    await expect(page.getByText("Nouvel Email")).toBeVisible({ timeout: 2000 });
  });

  test("ajoute une étape Attente en cliquant + Attente", async ({ page }) => {
    const addWait = page.getByRole("button", { name: /\+ Attente/ });
    await addWait.click();

    await expect(page.getByText("Nouvelle Attente")).toBeVisible({ timeout: 2000 });
  });

  test("le nom de campagne est éditable par clic", async ({ page }) => {
    const title = page.getByText("SaaS Outreach Q2");
    await title.click();

    // Un input doit apparaître
    const input = page.locator("input[value='SaaS Outreach Q2']");
    await expect(input).toBeVisible();

    // On modifie le nom
    await input.fill("Test Campaign");
    await input.press("Enter");

    await expect(page.getByText("Test Campaign")).toBeVisible();
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
