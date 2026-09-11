import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Attrition IQ — Hybrid ML + BI Employee Attrition Analytics",
  description:
    "A hybrid Machine Learning and Business Intelligence platform for analyzing, predicting, and reducing employee attrition across departments, cities, and workforce segments.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
