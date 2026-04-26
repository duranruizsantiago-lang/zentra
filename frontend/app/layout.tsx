import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zentra ESG — Sostenibilidad para PYMEs",
    template: "%s | Zentra ESG",
  },
  description:
    "Plataforma ESG-as-a-Service para PYMEs españolas. Autodiagnóstico ASG, huella de carbono, informes VSME y asistente IA.",
  keywords: ["ESG", "sostenibilidad", "PYME", "VSME", "huella carbono", "informe ESG"],
  openGraph: {
    title: "Zentra ESG — Sostenibilidad para PYMEs",
    description:
      "Plataforma ESG-as-a-Service para PYMEs españolas. Autodiagnóstico ASG, huella de carbono, informes VSME y asistente IA.",
    type: "website",
    locale: "es_ES",
    siteName: "Zentra ESG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zentra ESG — Sostenibilidad para PYMEs",
    description:
      "Plataforma ESG-as-a-Service para PYMEs españolas.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
