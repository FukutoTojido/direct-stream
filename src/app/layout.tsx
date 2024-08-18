import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Direct Stream",
    description: "Tsukimura Temari Radio 24/7",
    icons: {
        icon: "/@.svg",
    },
    openGraph: {
        title: "Direct Stream",
        description: "Tsukimura Temari Radio 24/7",
        images: "https://cdn.tryz.id.vn/temari.jpg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
