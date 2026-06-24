import "./globals.css";

export const metadata = {
  title: "FinSight — AI Financial Document Analyzer",
  description:
    "Upload financial PDFs and get a structured brief, dynamic dashboard, and AI chat grounded in your documents.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-white text-ink antialiased">{children}</body>
    </html>
  );
}
