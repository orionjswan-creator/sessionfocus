import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SessionFocus MVP",
  description: "Human-reviewed psychological support and social work documentation assistant",
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-moss/15 bg-linen/85 backdrop-blur">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4">
            <Link href="/dashboard" className="flex items-center gap-3 font-semibold text-ink">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-moss text-white">
                <ClipboardCheck size={20} aria-hidden />
              </span>
              <span>SessionFocus</span>
            </Link>
            <p className="hidden max-w-3xl text-sm text-ink/70 md:block">
              AI-assisted psychological support and social work documentation for practitioner review.
            </p>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
