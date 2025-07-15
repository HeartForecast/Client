import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChildProvider } from "@/app/contexts/ChildContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HeartForecast",
  description: "감정 예보 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ChildProvider>
          {children}
        </ChildProvider>
      </body>
    </html>
  );
}
