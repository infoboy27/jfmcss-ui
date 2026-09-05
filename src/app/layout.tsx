import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JFMCSS — Software Studio",
  description:
    "Apps móviles, plataformas web y soluciones digitales a la medida. Desarrollo moderno, práctico y orientado a resolver necesidades reales.",
  metadataBase: new URL("https://jfmcss.com"),
  openGraph: {
    title: "JFMCSS — Software Studio",
    description:
      "Apps móviles, plataformas web y soluciones digitales a la medida.",
    url: "https://jfmcss.com",
    siteName: "JFMCSS",
    images: ["/assets/logo-stacked.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/assets/logo-stacked.png"],
  },
  icons: {
    icon: "/assets/favicon.png",
    apple: "/assets/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
