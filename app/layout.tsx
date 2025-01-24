import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AllStrings from "@/src/lang/strings";
import CommonFooter from "@/src/common/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${AllStrings.CommonMetadata.HeaderSMTitle}`,
  metadataBase: new URL(process.env.NEXT_PUBLIC_HOST || ""),
  twitter: {
    images: "imagesets/no-stream/JuniBawl.png",
  },
  openGraph: {
    images: "imagesets/no-stream/JuniBawl.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <div className="fillSpaceContainer"></div>
        <CommonFooter />
      </body>
    </html>
  );
}
