"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import {
  FileSpreadsheet,
  Upload,
  ArrowLeft,
  Download,
  RefreshCw,
  Settings,
  BarChart,
  FileCode,
  PieChart,
  Database,
  AlertCircle,
  Sparkles,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EnhancedCsvTable } from "./enhanced-csv-table"
import { CsvStatisticsPanel } from "./csv-statistics-panel"
import { CsvAnimation } from "./csv-animation"
import { ComparisonView } from "./comparison-view"
import { TableVisualizationOptions } from "./table-visualization-options"
import { InsightsPanel } from "./insights-panel"
import { FormulaHelperDialog } from "./formula-editor"
import { parseCSV, generateCSV, detectColumnTypes } from "@/lib/utils/csv-parser"
import { processCSV, DEFAULT_PROCESS_OPTIONS } from "@/lib/utils/csv-processor"
import { getSampleData, getSampleDataWithFormulas } from "@/lib/utils/sample-data"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { useToast } from "@/hooks/use-toast"

export default function FixCSVPage() {
  const [file, setFile] = useState<File | null>(null)
  const [originalData, setOriginalData] = useState<string[][]>([])
  const [processedData, setProcessedData] = useState<string[][]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [options, setOptions] = useState(DEFAULT_PROCESS_OPTIONS)
  const [showStatistics, setShowStatistics] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [showStylingOptions, setShowStylingOptions] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [sortedData, setSortedData] = useState<string[][]>([])
  const [columnTypes, setColumnTypes] = useState<string[]>([])
  const [displayOptions, setDisplayOptions] = useState({
    fontSize: 14,
    cellPadding: 16,
    borderStyle: "thin",
    alternateRows: true,
    highlightHover: true,
    showGridlines: true,
    wrapText: false,
    truncateText: true,
    showMiniCharts: false,
    useHeatmap: false,
    showIcons: true,
  })
  const [isLoadingSample, setIsLoadingSample] = useState(false)
  const [activeView, setActiveView] = useState<string>("original")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showProcessingAnimation, setShowProcessingAnimation] = useState(false)
  const { toast } = useToast()

  // Update sorted data when processed data changes
  useEffect(() => {
    setSortedData(processedData)
  }, [processedData])

  // Detect column types when data is loaded
  useEffect(() => {
    if (originalData.length > 0) {
      setColumnTypes(detectColumnTypes(originalData))
    }
  }, [originalData])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const csvContent = event.target.result as string
          const rows = parseCSV(csvContent)
          setOriginalData(rows)
          setProcessedData([])
          setSortedData([])
        }
      }
      reader.readAsText(selectedFile)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)

      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const csvContent = event.target.result as string
          const rows = parseCSV(csvContent)
          setOriginalData(rows)
          setProcessedData([])
          setSortedData([])
        }
      }
      reader.readAsText(droppedFile)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }))
  }

  const processFile = () => {
    if (!originalData.length) return

    setIsProcessing(true)
    setShowProcessingAnimation(true)

    // Use setTimeout to allow the animation to render
    setTimeout(() => {
      // Process the CSV data with the selected options
      const result = processCSV(originalData, options)

      setProcessedData(result)
      setSortedData(result)
      setActiveView("processed")

      // Keep the animation visible briefly after processing completes
      setTimeout(() => {
        setIsProcessing(false)
      }, 500)
    }, 500)
  }

  const downloadCSV = () => {
    if (!processedData.length) return

    const csvContent = generateCSV(processedData)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `fixed_${file?.name || "data.csv"}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "CSV Exported Successfully",
      description: `Your file has been exported as fixed_${file?.name || "data.csv"}`,
    })
  }

  const exportStyledData = (format: string) => {
    if (!processedData.length) return

    switch (format) {
      case "excel":
        exportToExcel()
        break
      case "html":
        exportToHtml()
        break
      case "pdf":
        exportToPdf()
        break
      default:
        downloadCSV() // Default to CSV
    }
  }

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(processedData)

    // Add some basic styling
    const cols = processedData[0].map(() => ({ wch: 20 })) // Set column width
    worksheet["!cols"] = cols

    XLSX.utils.book_append_sheet(workbook, worksheet, "Processed Data")
    XLSX.writeFile(workbook, `fixed_${file?.name || "data"}.xlsx`)

    toast({
      title: "Excel File Exported",
      description: `Your data has been exported as fixed_${file?.name || "data"}.xlsx`,
    })
  }

  const exportToHtml = () => {
    const htmlStart = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Fixed CSV Data</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #34B76F; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
          h1 { color: #34B76F; }
        </style>
      </head>
      <body>
        <h1>Processed CSV Data</h1>
        <p>Cleaned by Fix My CSV by Seirei Club</p>
        <table>
          <thead>
            <tr>
    `

    const headers = processedData[0].map((header) => `<th>${header}</th>`).join("")
    const rows = processedData
      .slice(1)
      .map((row) => {
        const cells = row.map((cell) => `<td>${cell}</td>`).join("")
        return `<tr>${cells}</tr>`
      })
      .join("")

    const htmlEnd = `
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()} by Fix My CSV by Seirei Club</p>
          <p>Original file: ${file?.name || "Unknown"}</p>
        </div>
      </body>
      </html>
    `

    const htmlContent = htmlStart + headers + htmlEnd
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `fixed_${file?.name || "data"}.html`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "HTML File Exported",
      description: `Your data has been exported as fixed_${file?.name || "data"}.html`,
    })
  }

  const exportToPdf = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.setTextColor(52, 183, 111) // Green color
    doc.text("Processed CSV Data", 14, 22)

    // Add subtitle
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text("Cleaned by Fix My CSV by Seirei Club", 14, 30)

    // Add table
    const headers = processedData[0]
    const rows = processedData.slice(1)

    // @ts-ignore - jspdf-autotable types are not included
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [52, 183, 111] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: { 0: { cellWidth: 30 } },
      margin: { top: 40 },
    })

    // Add footer
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `Generated on ${new Date().toLocaleString()} by Fix My CSV by Seirei Club`,
      14,
      doc.internal.pageSize.height - 10,
    )

    // Save PDF
    doc.save(`fixed_${file?.name || "data"}.pdf`)

    toast({
      title: "PDF File Exported",
      description: `Your data has been exported as fixed_${file?.name || "data"}.pdf`,
    })
  }

  const handleSort = (columnIndex: number, direction: "asc" | "desc") => {
    if (!processedData.length) return

    const headers = processedData[0]
    const rows = processedData.slice(1)

    const sortedRows = [...rows].sort((a, b) => {
      const valueA = a[columnIndex] || ""
      const valueB = b[columnIndex] || ""

      // Try to sort numerically if possible
      const numA = Number.parseFloat(valueA.replace(/[^\d.-]/g, ""))
      const numB = Number.parseFloat(valueB.replace(/[^\d.-]/g, ""))

      if (!isNaN(numA) && !isNaN(numB)) {
        return direction === "asc" ? numA - numB : numB - numA
      }

      // Fall back to string comparison
      return direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
    })

    setSortedData([headers, ...sortedRows])
  }

  const handleFilter = (columnIndex: number, filterValue: string) => {
    if (!processedData.length || !filterValue) {
      setSortedData(processedData)
      return
    }

    const headers = processedData[0]
    const rows = processedData.slice(1)

    const filteredRows = rows.filter((row) => {
      const cellValue = row[columnIndex] || ""
      return cellValue.toLowerCase().includes(filterValue.toLowerCase())
    })

    setSortedData([headers, ...filteredRows])
  }

  const handleCellEdit = (rowIndex: number, colIndex: number, value: string) => {
    // Create a deep copy of the sorted data
    const newData = JSON.parse(JSON.stringify(sortedData))

    // Update the cell
    newData[rowIndex + 1][colIndex] = value

    // Update the sorted data
    setSortedData(newData)

    // Also update the processed data if it's not sorted or filtered
    if (JSON.stringify(sortedData) === JSON.stringify(processedData)) {
      setProcessedData(newData)
    }
  }

  const handleApplyTheme = (theme: any) => {
    // Update display options based on theme
    setDisplayOptions((prev) => ({
      ...prev,
      fontSize: theme.name === "Modern Blue" || theme.name === "Dark Elegant" ? 12 : 14,
      cellPadding: theme.name === "Compact" ? 8 : 16,
      borderStyle: theme.name === "Forest Green" ? "thick" : theme.name === "Modern Blue" ? "medium" : "thin",
      alternateRows: theme.name !== "Minimal",
      showGridlines: theme.name !== "Minimal",
      useHeatmap: theme.name === "Warm Autumn" || theme.name === "CSV Green",
      showIcons: theme.name !== "Minimal",
    }))

    // Apply theme to charts and visualizations
    document.documentElement.style.setProperty("--chart-primary-color", theme.accentColor.replace("bg-", ""))

    toast({
      title: "Theme Applied",
      description: `The "${theme.name}" theme has been applied to your data.`,
      className: "bg-csv-green-50 border-csv-green-200",
    })
  }

  const handleChangeDisplay = (newOptions: any) => {
    setDisplayOptions((prev) => ({
      ...prev,
      ...newOptions,
    }))
  }

  const handleSavePreset = (name: string) => {
    // Save current settings as a preset (would be implemented with localStorage or similar)
    toast({
      title: "Preset Saved",
      description: `Your settings have been saved as "${name}"`,
      className: "bg-csv-green-50 border-csv-green-200",
    })
  }

  const loadSampleData = (withFormulas = false) => {
    setIsLoadingSample(true)

    setTimeout(() => {
      const rows = withFormulas ? getSampleDataWithFormulas() : getSampleData()
      setFile(
        new File([withFormulas ? "sample-data-with-formulas.csv" : "sample-data.csv"], "messy-data.csv", {
          type: "text/csv",
        }),
      )
      setOriginalData(rows)
      setProcessedData([])
      setSortedData([])
      setIsLoadingSample(false)

      toast({
        title: "Sample Data Loaded",
        description: `Sample data ${withFormulas ? "with formulas " : ""}has been loaded successfully. Process it to see the fixes!`,
        className: "bg-csv-green-50 border-csv-green-200",
      })
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white to-csv-green-50/30">
      <header className="sticky top-0 z-40 w-full border-b border-csv-green-200 bg-gradient-to-r from-csv-green-600 to-csv-green-700 backdrop-blur supports-[backdrop-filter]:bg-csv-green-600/90">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <FileSpreadsheet className="h-5 w-5 text-white" />
            <span>Fix My CSV</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">by Seirei Club</span>
          </Link>
          <Link href="/" className="ml-auto flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8 text-csv-green-800">Fix My CSV</h1>

        {!originalData.length && (
          <Card className="csv-theme-card p-8">
            <div
              className="border-2 border-dashed border-csv-green-200 rounded-lg p-12 text-center cursor-pointer hover:bg-csv-green-50/50 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
              <Upload className="h-12 w-12 mx-auto mb-4 text-csv-green-500" />
              <h2 className="text-xl font-medium mb-2 text-csv-green-800">Upload your CSV file</h2>
              <p className="text-csv-green-600 mb-4">Drag and drop your file here or click to browse</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="csv-theme-button">Select CSV File</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-csv-green-200 text-csv-green-700"
                      disabled={isLoadingSample}
                    >
                      {isLoadingSample ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Database className="mr-2 h-4 w-4" />
                          Load Sample Data
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => loadSampleData(false)}>Regular Sample Data</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => loadSampleData(true)}>Sample Data with Formulas</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        )}

        {originalData.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              <Card className="csv-theme-card p-6 col-span-12 lg:col-span-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-csv-green-800">Cleaning Options</h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-csv-green-700">
                        <Settings className="h-4 w-4" />
                        <span className="sr-only">Settings</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setOptions(DEFAULT_PROCESS_OPTIONS)}>
                        Reset to defaults
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setOptions({
                            ...DEFAULT_PROCESS_OPTIONS,
                            removeEmptyRows: true,
                            standardizeDates: true,
                            removeDuplicates: true,
                            formatCurrencies: true,
                            formatPhoneNumbers: true,
                          })
                        }
                      >
                        Basic cleaning only
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setOptions({
                            ...DEFAULT_PROCESS_OPTIONS,
                            evaluateFormulas: true,
                            detectOutliers: true,
                            fixInvalidDates: true,
                          })
                        }
                      >
                        Advanced cleaning only
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Accordion type="multiple" defaultValue={["basic", "advanced"]} className="mb-4">
                  <AccordionItem value="basic" className="border-csv-green-200">
                    <AccordionTrigger className="text-csv-green-800">Basic Cleaning</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <TooltipProvider>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="removeEmptyRows"
                              checked={options.removeEmptyRows}
                              onCheckedChange={() => handleOptionChange("removeEmptyRows")}
                              className="text-csv-green-600 border-csv-green-300"
                            />
                            <div className="flex items-center">
                              <Label htmlFor="removeEmptyRows">Remove empty rows</Label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-3.5 w-3.5 ml-1 text-csv-green-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[200px]">
                                    Removes rows that are completely empty or contain only whitespace
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </TooltipProvider>

                        <TooltipProvider>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="removeEmptyColumns"
                              checked={options.removeEmptyColumns}
                              onCheckedChange={() => handleOptionChange("removeEmptyColumns")}
                              className="text-csv-green-600 border-csv-green-300"
                            />
                            <div className="flex items-center">
                              <Label htmlFor="removeEmptyColumns">Remove empty columns</Label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-3.5 w-3.5 ml-1 text-csv-green-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[200px]">
                                    Removes columns that are completely empty or contain only whitespace
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </TooltipProvider>

                        <TooltipProvider>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="standardizeDates"
                              checked={options.standardizeDates}
                              onCheckedChange={() => handleOptionChange("standardizeDates")}
                              className="text-csv-green-600 border-csv-green-300"
                            />
                            <div className="flex items-center">
                              <Label htmlFor="standardizeDates">Standardize date formats</Label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-3.5 w-3.5 ml-1 text-csv-green-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[200px]">Converts dates to YYYY-MM-DD format</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </TooltipProvider>

                        <TooltipProvider>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="removeDuplicates"
                              checked={options.removeDuplicates}
                              onCheckedChange={() => handleOptionChange("removeDuplicates")}
                              className="text-csv-green-600 border-csv-green-300"
                            />
                            <div className="flex items-center">
                              <Label htmlFor="removeDuplicates">Remove duplicates</Label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-3.5 w-3.5 ml-1 text-csv-green-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[200px]">Removes duplicate rows from the data</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </TooltipProvider>

                        <TooltipProvider>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="formatCurrencies"
                              checked={options.formatCurrencies}
                              onCheckedChange={() => handleOptionChange("formatCurrencies")}
                              className="text-csv-green-600 border-csv-green-300"
                            />
                            <div className="flex items-center">
                              <Label htmlFor="formatCurrencies">Format currencies</Label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-3.5 w-3.5 ml-1 text-csv-green-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[200px]">Standardizes currency values with proper formatting</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </TooltipProvider>

                        <TooltipProvider>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="formatPhoneNumbers"
                              checked={options.formatPhoneNumbers}
                              onCheckedChange={() => handleOptionChange("formatPhoneNumbers")}
                              className="text-csv-green-600 border-csv-green-300"
                            />
                            <div className="flex items-center">
                              <Label htmlFor="formatPhoneNumbers">Format phone numbers</Label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-3.5 w-3.5 ml-1 text-csv-green-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[200px]">Standardizes phone numbers to (XXX) XXX-XXXX format</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </TooltipProvider>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="advanced" className="border-csv-green-200">
                    <AccordionTrigger className="text-csv-green-800">Advanced Options</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <TooltipProvider>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="evaluateFormulas"
                              checked={options.evaluateFormulas}
                              onCheckedChange={() => handleOptionChange("evaluateFormulas")}
                              className="text-csv-green-600 border-csv-green-300"
                            />
                            <div className="flex items-center">
                              <Label htmlFor="evaluateFormulas">Evaluate formulas</Label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-3.5 w-3.5 ml-1 text-csv-green-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[200px]">Calculates the results of simple formulas in cells</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </TooltipProvider>

                        <TooltipProvider>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="detectOutliers"
                              checked={options.detectOutliers}
                              onCheckedChange={() => handleOptionChange("detectOutliers")}
                              className="text-csv-green-600 border-csv-green-300"
                            />
                            <div className="flex items-center">
                              <Label htmlFor="detectOutliers">Detect outliers</Label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-3.5 w-3.5 ml-1 text-csv-green-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[200px]">Identifies statistical outliers in numeric columns</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </TooltipProvider>

                        <TooltipProvider>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="fixInvalidDates"
                              checked={options.fixInvalidDates}
                              onCheckedChange={() => handleOptionChange("fixInvalidDates")}
                              className="text-csv-green-600 border-csv-green-300"
                            />
                            <div className="flex items-center">
                              <Label htmlFor="fixInvalidDates">Fix invalid dates</Label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-3.5 w-3.5 ml-1 text-csv-green-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-[200px]">Attempts to correct obviously wrong dates</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </TooltipProvider>

                        <div className="pt-2">
                          <FormulaHelperDialog />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Separator className="my-4 bg-csv-green-200" />

                <div className="space-y-4">
                  <Button onClick={processFile} className="w-full csv-theme-button" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Process CSV"
                    )}
                  </Button>

                  {processedData.length > 0 && (
                    <Button
                      onClick={downloadCSV}
                      variant="outline"
                      className="w-full border-csv-green-200 text-csv-green-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Fixed CSV
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {processedData.length > 0 && (
                      <Button
                        variant="outline"
                        className={`w-full border-csv-green-200 ${showStatistics ? "bg-csv-green-100 text-csv-green-800" : "text-csv-green-700"}`}
                        onClick={() => setShowStatistics(!showStatistics)}
                      >
                        <BarChart className="mr-2 h-4 w-4" />
                        {showStatistics ? "Hide Stats" : "Show Stats"}
                      </Button>
                    )}

                    {processedData.length > 0 && (
                      <Button
                        variant="outline"
                        className={`w-full border-csv-green-200 ${showComparison ? "bg-csv-green-100 text-csv-green-800" : "text-csv-green-700"}`}
                        onClick={() => setShowComparison(!showComparison)}
                      >
                        <PieChart className="mr-2 h-4 w-4" />
                        {showComparison ? "Hide Compare" : "Compare"}
                      </Button>
                    )}

                    {processedData.length > 0 && (
                      <Button
                        variant="outline"
                        className={`w-full border-csv-green-200 ${showStylingOptions ? "bg-csv-green-100 text-csv-green-800" : "text-csv-green-700"}`}
                        onClick={() => setShowStylingOptions(!showStylingOptions)}
                      >
                        <FileCode className="mr-2 h-4 w-4" />
                        {showStylingOptions ? "Hide Styling" : "Styling"}
                      </Button>
                    )}

                    {processedData.length > 0 && (
                      <Button
                        variant="outline"
                        className={`w-full border-csv-green-200 ${showInsights ? "bg-csv-green-100 text-csv-green-800" : "text-csv-green-700"}`}
                        onClick={() => setShowInsights(!showInsights)}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {showInsights ? "Hide Insights" : "Insights"}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-sm text-csv-green-700 mt-4 p-3 bg-csv-green-50 rounded-md">
                  <p className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" /> File: {file?.name}
                  </p>
                  <p className="flex items-center mt-1">
                    <Database className="h-4 w-4 mr-1" /> Size: {file ? `${(file.size / 1024).toFixed(2)} KB` : ""}
                  </p>
                  {processedData.length > 0 && (
                    <p className="flex items-center mt-1">
                      <BarChart className="h-4 w-4 mr-1" /> Rows: {processedData.length - 1} (after processing)
                    </p>
                  )}
                </div>
              </Card>

              <Card className="csv-theme-card p-6 col-span-12 lg:col-span-9">
                <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-csv-green-800">Preview</h2>
                    <TabsList>
                      <TabsTrigger value="original">Original</TabsTrigger>
                      <TabsTrigger value="processed" disabled={!processedData.length}>
                        Processed
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="original" className="mt-0">
                    <div className="border border-csv-green-200 rounded-md overflow-auto max-h-[500px]">
                      <EnhancedCsvTable data={originalData} displayOptions={displayOptions} columnTypes={columnTypes} />
                    </div>
                  </TabsContent>

                  <TabsContent value="processed" className="mt-0">
                    {processedData.length > 0 ? (
                      <div className="border border-csv-green-200 rounded-md overflow-auto max-h-[500px]">
                        <EnhancedCsvTable
                          data={sortedData}
                          onSort={handleSort}
                          onFilter={handleFilter}
                          onCellEdit={handleCellEdit}
                          highlightChanges={true}
                          originalData={originalData}
                          isLoading={isProcessing}
                          displayOptions={displayOptions}
                          columnTypes={columnTypes}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-12 text-csv-green-600 bg-csv-green-50 rounded-md">
                        Process your CSV to see the results
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            {showStatistics && processedData.length > 0 && <CsvStatisticsPanel data={processedData} />}

            {showComparison && processedData.length > 0 && (
              <ComparisonView originalData={originalData} processedData={processedData} />
            )}

            {showStylingOptions && processedData.length > 0 && (
              <TableVisualizationOptions
                onApplyTheme={handleApplyTheme}
                onExportStyled={exportStyledData}
                onSavePreset={handleSavePreset}
                onChangeDisplay={handleChangeDisplay}
              />
            )}

            {showInsights && processedData.length > 0 && (
              <InsightsPanel data={processedData} columnTypes={columnTypes} />
            )}
          </div>
        )}

        {/* CSV Processing Animation */}
        <CsvAnimation
          isProcessing={isProcessing}
          originalData={originalData}
          processedData={processedData}
          onClose={() => setShowProcessingAnimation(false)}
        />
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

