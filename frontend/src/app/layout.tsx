import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/shared/Providers";

export const metadata: Metadata = {
  title: "ProspectOS",
  description: "B2B Cold Outreach Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
