"use client"

import Link from "next/link"
import { ArrowRight, FileSpreadsheet, Trash, Calendar, Copy, DollarSign, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-csv-green-200 bg-gradient-to-r from-csv-green-600 to-csv-green-700 backdrop-blur supports-[backdrop-filter]:bg-csv-green-600/90">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2 font-bold text-white">
            <FileSpreadsheet className="h-5 w-5 text-white" />
            <span>Fix My CSV</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">by Seirei Club</span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="#features" className="text-sm font-medium text-white/90 hover:text-white">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-white/90 hover:text-white">
              How It Works
            </Link>
            <Link href="/fix-csv" className="text-sm font-medium text-white/90 hover:text-white">
              Get Started
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-white to-csv-green-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-csv-green-800">
                  Clean up messy CSV files <span className="text-csv-green-600">in seconds</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Transform chaotic spreadsheet data into clean, organized information with just a few clicks. No more
                  manual formatting or data wrangling.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/fix-csv">
                  <Button size="lg" className="h-12 px-8 bg-csv-gradient hover:bg-csv-gradient-hover">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Animated Comparison Widget */}
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="relative bg-white rounded-xl shadow-xl overflow-hidden border border-csv-green-200">
                <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-r from-csv-green-600 to-csv-green-700 flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-white text-sm ml-4 font-medium">CSV Transformation</div>
                </div>

                <div className="pt-10 grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-red-500 font-medium">
                      <Trash className="h-5 w-5" />
                      <h3>Before: Messy Data</h3>
                    </div>
                    <div className="bg-gray-100 rounded-md p-3 font-mono text-xs overflow-auto h-64">
                      <motion.pre
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="whitespace-pre"
                      >
                        {`Name,Date of Birth,Email,Phone
John Smith,1/15/1985,john.smith@example.com,(555) 123-4567
Jane Doe,02/28/1990,jane.doe@example.com,555.987.6543
Michael Johnson,3-17-1978,michael.j@example,5551234567
Emily Williams,,emily@example.com,(555)456-7890
David Brown,05/05/1982,david.brown@example.com,555 789 0123
Sarah Miller,6.12.1995,sarah.miller@example.com,+1 555 234 5678
Robert Wilson,1977-07-22,robert@example.com,(555) 345-6789
Jennifer Taylor,08/30/1988,jennifer.t@example.com,555-456-7890`}
                      </motion.pre>
                    </div>
                    <div className="text-sm text-gray-500">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Inconsistent date formats</li>
                        <li>Messy phone numbers</li>
                        <li>Missing data</li>
                        <li>No standardization</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-csv-green-600 font-medium">
                      <CheckCircle2 className="h-5 w-5" />
                      <h3>After: Clean Data</h3>
                    </div>
                    <div className="bg-csv-green-50 rounded-md p-3 font-mono text-xs overflow-auto h-64 border border-csv-green-200">
                      <motion.pre
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="whitespace-pre"
                      >
                        {`Name,Date of Birth,Email,Phone
John Smith,1985-01-15,john.smith@example.com,(555) 123-4567
Jane Doe,1990-02-28,jane.doe@example.com,(555) 987-6543
Michael Johnson,1978-03-17,michael.j@example,(555) 123-4567
Emily Williams,,emily@example.com,(555) 456-7890
David Brown,1982-05-05,david.brown@example.com,(555) 789-0123
Sarah Miller,1995-06-12,sarah.miller@example.com,(555) 234-5678
Robert Wilson,1977-07-22,robert@example.com,(555) 345-6789
Jennifer Taylor,1988-08-30,jennifer.t@example.com,(555) 456-7890`}
                      </motion.pre>
                    </div>
                    <div className="text-sm text-csv-green-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Standardized YYYY-MM-DD dates</li>
                        <li>Consistent (XXX) XXX-XXXX phone format</li>
                        <li>Preserved original data where appropriate</li>
                        <li>Ready for analysis or import</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-csv-green-50 to-white border-t border-csv-green-200">
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="h-5 w-5 text-csv-green-600 animate-pulse" />
                    <span className="text-csv-green-800 font-medium">Automatic transformation in seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-csv-green-800">
                Features
              </h2>
              <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our powerful CSV cleaning tool automatically handles common data issues
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8 xl:gap-10 mt-8">
              <div className="flex flex-col items-center space-y-2 rounded-lg border border-csv-green-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <Trash className="h-8 w-8 text-csv-green-600" />
                <h3 className="text-xl font-bold text-csv-green-800">Remove Empty Rows</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Automatically detect and remove empty or blank rows from your data
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border border-csv-green-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <Calendar className="h-8 w-8 text-csv-green-600" />
                <h3 className="text-xl font-bold text-csv-green-800">Standardize Dates</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Convert dates to a consistent format across your entire dataset
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border border-csv-green-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <Copy className="h-8 w-8 text-csv-green-600" />
                <h3 className="text-xl font-bold text-csv-green-800">Remove Duplicates</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Find and eliminate duplicate entries to keep your data clean
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border border-csv-green-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <DollarSign className="h-8 w-8 text-csv-green-600" />
                <h3 className="text-xl font-bold text-csv-green-800">Format Values</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Properly format currencies, phone numbers, and other special values
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-white to-csv-green-50"
        >
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-csv-green-800">
                How It Works
              </h2>
              <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Clean up your CSV files in three simple steps
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-10 sm:grid-cols-3 mt-8">
              <div className="relative flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-csv-gradient text-white">
                  1
                </div>
                <h3 className="text-xl font-bold text-csv-green-800">Upload Your CSV</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Drag and drop or select your CSV file to upload
                </p>
              </div>
              <div className="relative flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-csv-gradient text-white">
                  2
                </div>
                <h3 className="text-xl font-bold text-csv-green-800">Select Cleaning Options</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Choose which cleaning operations to apply to your data
                </p>
              </div>
              <div className="relative flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-csv-gradient text-white">
                  3
                </div>
                <h3 className="text-xl font-bold text-csv-green-800">Download Clean CSV</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Preview the changes and download your cleaned CSV file
                </p>
              </div>
            </div>
            <div className="mt-12 flex justify-center">
              <Link href="/fix-csv">
                <Button size="lg" className="h-12 px-8 bg-csv-gradient hover:bg-csv-gradient-hover">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t border-csv-green-200 py-6 bg-white">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <p className="text-center text-sm text-csv-green-700">
            © {new Date().getFullYear()} Fix My CSV by Seirei Club. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

