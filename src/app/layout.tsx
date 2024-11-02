// Import required modules and components
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google"; // Import Google Fonts from next/font/google
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";

// Load Google Fonts
const font = DM_Sans({subsets:['latin']})

// Define page metadata
export const metadata: Metadata = {
  title: "Aditya",
  description: "Automate the work",
};

// RootLayout Component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${font.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
