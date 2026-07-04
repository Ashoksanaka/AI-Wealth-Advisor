import { Sora, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Digital Wealth Advisor | YourBank",
  description:
    "AI-powered digital wealth management with avatar-based advisory, integrated for bank mobile apps.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${sora.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} font-body antialiased`}
        >
          <Header />
          <main className="min-h-screen dot-grid bg-background">{children}</main>
          <Toaster theme="dark" richColors />
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
