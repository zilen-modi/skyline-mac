import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { profile, site } from "@/data/portfolio";
import { themeBootstrap } from "@/lib/themeBootstrap";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  authors: [{ name: profile.name, url: profile.linkedin }],
  keywords: ["Zilen Modi", "Full Stack Engineer", "Next.js", "React", "TypeScript", "Python", "AWS", "portfolio"],
  alternates: { canonical: "/" },
  openGraph: { type: "profile", url: "/", title: site.title, description: site.description, siteName: profile.name, firstName: "Zilen", lastName: "Modi" },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#111318" },
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  url: site.url,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Ahmedabad", addressCountry: "IN" },
  sameAs: [profile.linkedin, profile.github],
  knowsAbout: ["React", "Next.js", "TypeScript", "Node.js", "Python", "AWS"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${geist.variable} ${mono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
