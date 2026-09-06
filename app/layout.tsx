import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AprovaTrilha - Guarda Municipal Itajaí",
  description: "Plataforma de estudos para concursos públicos",
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
