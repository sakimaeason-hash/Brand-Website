import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout/Layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "GoldSeason | Freedom in Every Step",
  description: "GoldSeason is dedicated to providing lightweight, reliable, and easy-to-use mobility solutions for seniors. Medical-grade quality with warm design and service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-[#FAF8F5]`}
      >
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
