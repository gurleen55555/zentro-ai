import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zentro AI | Microsoft IQ Business Operating System",
  description:
    "A multi-step business reasoning agent powered by Foundry IQ and Fabric IQ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
