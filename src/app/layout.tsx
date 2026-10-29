import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Car Manager",
  description: "Gerenciamento de veículos e pagamentos",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full bg-[#F8FAFC] text-[#0F172A]">{children}</body>
    </html>
  );
}
