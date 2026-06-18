import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { BookOpenCheck, BrainCircuit } from "lucide-react";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PrepWise AI – Smart Study Planner",
  description:
    "AI-powered study planner that generates personalized schedules for your exams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geist.className} antialiased min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20`}>
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-md shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="p-1.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-lg tracking-tight">
                  Prep<span className="text-indigo-600">Wise</span>
                  <span className="text-xs font-medium text-purple-500 ml-1 bg-purple-50 px-1.5 py-0.5 rounded-full">AI</span>
                </span>
              </Link>

              {/* Nav Links */}
              <div className="flex items-center gap-1">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-150"
                >
                  <BrainCircuit className="w-4 h-4" />
                  Plan
                </Link>
                <Link
                  href="/plans"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-150"
                >
                  <BookOpenCheck className="w-4 h-4" />
                  My Plans
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-100 bg-white/50 backdrop-blur-sm mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-gray-400">
              © 2026 PrepWise AI · Built with Next.js, Supabase &amp; Groq
            </p>
            <p className="text-xs text-gray-500 font-medium">
              Built by{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                Nduhura Marvin
              </span>{" "}
              · Smart studying starts here 🎓
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
