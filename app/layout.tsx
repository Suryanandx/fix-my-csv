import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fix My CSV – Clean & Convert CSV or Excel Data Instantly",
  description:
    "Fix My CSV is the easiest way to clean, format, and convert your CSV or Excel data. Remove errors, reformat columns, fix delimiters, and prepare data for import in seconds.",
  generator: "v0.dev",
  keywords: [
    "fix my csv",
    "csv fixer",
    "csv repair tool",
    "excel data fix",
    "csv upload error",
    "csv cleaning tool",
    "clean csv file",
    "convert csv to excel",
    "fix csv delimiter",
    "excel csv format",
    "csv import error",
    "remove blank rows csv",
    "reformat excel data",
    "csv for shopify",
    "csv parser online",
    "google sheets csv fix",
    "fix excel to csv formatting",
    "comma separated values",
    "fix utf-8 csv",
    "csv fix tool online",
    "csv cleaner web app",
    "excel cleanup tool",
    "spreadsheet formatter",
    "fix dates in csv",
    "csv character encoding",
    "csv fix newline",
    "fix csv not opening properly",
    "repair excel export",
    "csv editor online",
    "remove commas from csv",
  ],
  openGraph: {
    title: "Fix My CSV – Clean, Format & Fix CSV Files",
    description:
      "A fast and simple online tool to clean, convert, and fix CSV or Excel data errors. Ideal for importing into apps, Shopify, databases, and more.",
    url: "https://fix-my-csv.seireiclub.com",
    siteName: "Fix My CSV",
    images: [
      {
        url: "https://fix-my-csv.seireiclub.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fix My CSV – Clean CSV Tool",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fix My CSV – Fix and Clean Your CSV or Excel Data Instantly",
    description:
      "Quickly fix formatting issues, clean up CSV files, and prepare Excel data for import with our smart online CSV fixer.",
    images: ["https://fix-my-csv.seireiclub.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
