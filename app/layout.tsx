import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Somma Special Day",
  description: "1 ano Somma — Special Day",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
