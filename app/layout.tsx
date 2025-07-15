import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./auth/context";
import { ChildProvider } from "./contexts/ChildContext";

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
        <AuthProvider>
          <ChildProvider>
            {children}
          </ChildProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
