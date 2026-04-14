import { test, expect } from "@playwright/test";

test.describe("Page de connexion", () => {
  test.beforeEach(async ({ page }) => {
    // On s'assure qu'aucun token n'est présent
    await page.addInitScript(() => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    });
    await page.goto("/login");
  });

  test("affiche le branding et le formulaire", async ({ page }) => {
    // Brand panel (desktop)
    await expect(page.getByText("Uprising Outreach").first()).toBeVisible();
    await expect(page.getByText("Cold outreach,")).toBeVisible();
    await expect(page.getByText("AI-powered prospecting from lead sourcing")).toBeVisible();

    // Formulaire
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign in/i })).toBeVisible();
  });

  test("le champ email a le bon type", async ({ page }) => {
    const email = page.getByLabel("Email");
    await expect(email).toHaveAttribute("type", "email");
    await expect(email).toHaveAttribute("required", "");
  });

  test("le champ mot de passe est masqué", async ({ page }) => {
    const pwd = page.getByLabel("Password");
    await expect(pwd).toHaveAttribute("type", "password");
    await expect(pwd).toHaveAttribute("required", "");
  });

  test("le placeholder guide l'utilisateur", async ({ page }) => {
    await expect(page.getByPlaceholder("you@uprising.studio")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
  });

  test("affiche une erreur en cas d'identifiants invalides", async ({ page }) => {
    // Mock l'API pour retourner une 401
    await page.route("**/auth/login", (route) =>
      route.fulfill({ status: 401, body: JSON.stringify({ detail: "Unauthorized" }) })
    );

    await page.getByLabel("Email").fill("wrong@test.com");
    await page.getByLabel("Password").fill("badpassword");
    await page.getByRole("button", { name: /Sign in/i }).click();

    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("le bouton se désactive pendant le chargement", async ({ page }) => {
    // Bloque la réponse API indéfiniment pour capturer l'état loading
    await page.route("**/auth/login", (_route) => {
      // Ne répond pas → le bouton reste disabled
    });

    await page.getByLabel("Email").fill("user@test.com");
    await page.getByLabel("Password").fill("password123");

    const btn = page.getByRole("button", { name: /Sign in/i });
    await btn.click();

    // Le bouton doit afficher "Signing in…" et être désactivé
    await expect(page.getByRole("button", { name: /Signing in/i })).toBeDisabled();
  });

  test("redirige vers / après connexion réussie", async ({ page }) => {
    await page.route("**/auth/login", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "test-access-token",
          refresh_token: "test-refresh-token",
        }),
      })
    );
    // Mock aussi les appels API que / pourrait déclencher
    await page.route("**/leads**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [], total: 0 }) })
    );

    await page.getByLabel("Email").fill("user@uprising.studio");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: /Sign in/i }).click();

    await expect(page).toHaveURL("/", { timeout: 5000 });
  });
});
