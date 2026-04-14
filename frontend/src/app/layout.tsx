import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/shared/Providers";

export const metadata: Metadata = {
  title: "ProspectOS — Uprising Outreach",
  description: "AI-powered B2B cold outreach platform. Prospecting, campaigns, inbox and pipeline — in one workspace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var m = localStorage.getItem('theme-mode') || 'dark';
                var resolved = m === 'light' ? 'light' : m === 'dark' ? 'dark' : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', resolved);
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
