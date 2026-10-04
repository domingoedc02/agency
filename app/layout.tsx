import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrustMotion Agency",
  description: "A clear, capable digital partner for ambitious teams.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
