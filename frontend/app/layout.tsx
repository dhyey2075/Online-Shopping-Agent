import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AppProviders } from "@/components/providers/AppProviders"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ShopAgent — AI Shopping Assistant",
  description:
    "Chat with an AI shopping assistant that finds products across stores, manages your cart, and checks out securely.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#0f7a5a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
