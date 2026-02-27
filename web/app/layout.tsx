import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhotosApp",
  description: "Organize your photos into narratives and stories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
