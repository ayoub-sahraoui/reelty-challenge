import type { Metadata } from "next";
import { TRPCProvider } from "@/api/client";
import "./globals.css";

export const metadata: Metadata = {
  title: "Squircle Studio",
  description: "Professional video editing studio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full max-h-screen w-full overflow-hidden font-sans antialiased">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
