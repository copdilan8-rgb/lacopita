import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import SideMenu from "@/components/SideMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: true,
});

export const metadata = {
  title: "La Copita",
  description:
    "Sistema interno para empleados de la heladería La Copita (Familiar)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* 🔹 Esta línea asegura una vista perfecta en celulares */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-800`}
      >
        {/* ✅ El menú lateral debe estar aquí dentro */}
        <SideMenu />

        {children}
      </body>
    </html>
  );
}
