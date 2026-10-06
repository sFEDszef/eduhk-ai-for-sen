import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  title: "AI for Inclusive Mathematics | EdUHK",
  description:
    "A GenAI Tool to Tailor Early Primary Mathematics Materials for Students with Dyslexia",
};
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="header">
          <Link href="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              ＋
            </span>
            <span>
              Inclusive Maths<small>EdUHK · AI for SEN</small>
            </span>
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/about">About the project</Link>
            <Link href="/create" className="button small">
              Create material <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </header>
        {children}
        <footer>
          <span>Group 8 – AI for SEN · EDS6019</span>
          <span>AI assists. Teachers decide.</span>
        </footer>
      </body>
    </html>
  );
}
