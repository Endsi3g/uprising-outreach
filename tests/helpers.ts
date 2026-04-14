import { Page } from "@playwright/test";

/** Injecte un faux token dans localStorage pour bypasser la garde auth */
export async function injectAuthToken(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("access_token", "fake-test-token");
    localStorage.setItem("refresh_token", "fake-test-refresh");
  });
}

/** Mock la route API leads avec une liste de leads de test */
export async function mockLeadsAPI(page: Page) {
  await page.route("**/api/leads**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
            id: "1",
            full_name: "Sophie Martin",
            email: "sophie@agenceweb.fr",
            company_name: "Agence Web MTL",
            title: "Directrice",
            status: "scored",
            score: 82,
            source: "Apollo",
            notes: "Site web vieillissant, CTA peu visible.",
          },
          {
            id: "2",
            full_name: "Luc Tremblay",
            email: "luc@constructionmtl.ca",
            company_name: "Construction MTL",
            title: "Président",
            status: "raw",
            score: null,
            source: "LinkedIn",
            notes: null,
          },
        ],
        total: 2,
        page: 1,
        size: 50,
      }),
    })
  );
}
