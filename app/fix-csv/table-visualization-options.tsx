"use client"

import { useState, useEffect } from "react"
import { Settings2, Download, Save, FileSpreadsheet, FileCode, FileText, FileIcon as FilePdf } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"

interface TableTheme {
  name: string
  headerBg: string
  headerText: string
  rowBg: string
  altRowBg: string
  text: string
  border: string
  accentColor: string
}

const PREDEFINED_THEMES: TableTheme[] = [
  {
    name: "Default",
    headerBg: "bg-muted",
    headerText: "text-foreground",
    rowBg: "bg-card",
    altRowBg: "bg-muted/30",
    text: "text-foreground",
    border: "border-border",
    accentColor: "bg-primary",
  },
  {
    name: "CSV Green",
    headerBg: "bg-csv-green-600",
    headerText: "text-white",
    rowBg: "bg-white",
    altRowBg: "bg-csv-green-50",
    text: "text-gray-800",
    border: "border-csv-green-200",
    accentColor: "bg-csv-green-500",
  },
  {
    name: "Modern Blue",
    headerBg: "bg-blue-600",
    headerText: "text-white",
    rowBg: "bg-white",
    altRowBg: "bg-blue-50",
    text: "text-gray-800",
    border: "border-blue-200",
    accentColor: "bg-blue-500",
  },
  {
    name: "Forest Green",
    headerBg: "bg-green-700",
    headerText: "text-white",
    rowBg: "bg-white",
    altRowBg: "bg-green-50",
    text: "text-gray-800",
    border: "border-green-200",
    accentColor: "bg-green-500",
  },
  {
    name: "Dark Elegant",
    headerBg: "bg-gray-800",
    headerText: "text-white",
    rowBg: "bg-gray-100",
    altRowBg: "bg-gray-200",
    text: "text-gray-800",
    border: "border-gray-300",
    accentColor: "bg-gray-700",
  },
  {
    name: "Warm Autumn",
    headerBg: "bg-amber-600",
    headerText: "text-white",
    rowBg: "bg-white",
    altRowBg: "bg-amber-50",
    text: "text-gray-800",
    border: "border-amber-200",
    accentColor: "bg-amber-500",
  },
]

interface TableVisualizationOptionsProps {
  onApplyTheme: (theme: TableTheme) => void
  onExportStyled: (format: string) => void
  onSavePreset: (name: string) => void
  onChangeDisplay: (options: any) => void
  previewData?: string[][]
}

export function TableVisualizationOptions({
  onApplyTheme,
  onExportStyled,
  onSavePreset,
  onChangeDisplay,
  previewData = [
    ["Header 1", "Header 2", "Header 3"],
    ["Data 1", "Data 2", "Data 3"],
    ["Data 4", "Data 5", "Data 6"],
    ["Data 7", "Data 8", "Data 9"],
  ],
}: TableVisualizationOptionsProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>("CSV Green")
  const [customTheme, setCustomTheme] = useState<TableTheme>(
    PREDEFINED_THEMES.find((t) => t.name === "CSV Green") || PREDEFINED_THEMES[0],
  )
  const [fontSize, setFontSize] = useState(14)
  const [cellPadding, setCellPadding] = useState(16)
  const [borderStyle, setBorderStyle] = useState("thin")
  const [alternateRows, setAlternateRows] = useState(true)
  const [highlightHover, setHighlightHover] = useState(true)
  const [showGridlines, setShowGridlines] = useState(true)
  const [exportFormat, setExportFormat] = useState("excel")
  const [presetName, setPresetName] = useState("")
  const [sheetName, setSheetName] = useState("Processed Data")
  const [previewZoom, setPreviewZoom] = useState(100)
  const [showPreview, setShowPreview] = useState(true)

  // Data display options
  const [wrapText, setWrapText] = useState(false)
  const [truncateText, setTruncateText] = useState(true)
  const [showMiniCharts, setShowMiniCharts] = useState(false)
  const [useHeatmap, setUseHeatmap] = useState(false)
  const [showIcons, setShowIcons] = useState(true)

  // Apply theme immediately when selected
  useEffect(() => {
    handleDisplayOptionsChange()
  }, [
    fontSize,
    cellPadding,
    borderStyle,
    alternateRows,
    highlightHover,
    showGridlines,
    wrapText,
    truncateText,
    showMiniCharts,
    useHeatmap,
    showIcons,
    customTheme,
  ])

  const handleThemeSelect = (themeName: string) => {
    setSelectedTheme(themeName)
    const theme = PREDEFINED_THEMES.find((t) => t.name === themeName) || PREDEFINED_THEMES[0]
    setCustomTheme(theme)
    onApplyTheme(theme)

    // Apply theme to document for consistent styling
    document.documentElement.style.setProperty(
      "--primary-theme-color",
      theme.name === "CSV Green"
        ? "#34B76F"
        : theme.name === "Modern Blue"
          ? "#4285F4"
          : theme.name === "Forest Green"
            ? "#2EA563"
            : theme.name === "Dark Elegant"
              ? "#4A5568"
              : theme.name === "Warm Autumn"
                ? "#FB8C00"
                : "#34B76F",
    )
  }

  const handleDisplayOptionsChange = () => {
    onChangeDisplay({
      fontSize,
      cellPadding,
      borderStyle,
      alternateRows,
      highlightHover,
      showGridlines,
      wrapText,
      truncateText,
      showMiniCharts,
      useHeatmap,
      showIcons,
    })
  }

  const handleExport = () => {
    // Apply current theme settings before export
    onApplyTheme(customTheme)

    // Trigger export with selected format
    onExportStyled(exportFormat)

    toast({
      title: "Export Initiated",
      description: `Your data is being exported as ${getExportFormatName(exportFormat)}`,
      className: "bg-csv-green-50 border-csv-green-200",
    })
  }

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName)
      setPresetName("")
    }
  }

  const getExportIcon = (format: string) => {
    switch (format) {
      case "excel":
        return <FileSpreadsheet className="h-4 w-4 mr-2" />
      case "csv":
        return <FileText className="h-4 w-4 mr-2" />
      case "html":
        return <FileCode className="h-4 w-4 mr-2" />
      case "pdf":
        return <FilePdf className="h-4 w-4 mr-2" />
      default:
        return <Download className="h-4 w-4 mr-2" />
    }
  }

  return (
    <Card className="border-csv-green-200">
      <CardHeader className="bg-gradient-to-r from-csv-green-50 to-white">
        <CardTitle className="flex items-center space-x-2 text-csv-green-800">
          <Settings2 className="h-5 w-5 text-csv-green-500" />
          <span>Table Styling & Export Options</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="themes">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="display">Display Options</TabsTrigger>
            <TabsTrigger value="export">Preview & Export</TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-4">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="theme-select">Select Theme</Label>
                <Select value={selectedTheme} onValueChange={handleThemeSelect}>
                  <SelectTrigger id="theme-select">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_THEMES.map((theme) => (
                      <SelectItem key={theme.name} value={theme.name}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <Label className="mb-2 block">Theme Preview</Label>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={cn("border rounded-md overflow-hidden", customTheme.border)}
                >
                  <table className="w-full">
                    <thead>
                      <tr className={cn(customTheme.headerBg, customTheme.headerText)}>
                        <th className="p-2 text-left font-medium">Header 1</th>
                        <th className="p-2 text-left font-medium">Header 2</th>
                        <th className="p-2 text-left font-medium">Header 3</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={cn(customTheme.rowBg, customTheme.text)}>
                        <td className="p-2 border-t">Data 1</td>
                        <td className="p-2 border-t">Data 2</td>
                        <td className="p-2 border-t">Data 3</td>
                      </tr>
                      <tr className={cn(customTheme.altRowBg, customTheme.text)}>
                        <td className="p-2 border-t">Data 4</td>
                        <td className="p-2 border-t">Data 5</td>
                        <td className="p-2 border-t">Data 6</td>
                      </tr>
                      <tr className={cn(customTheme.rowBg, customTheme.text)}>
                        <td className="p-2 border-t">Data 7</td>
                        <td className="p-2 border-t">Data 8</td>
                        <td className="p-2 border-t">Data 9</td>
                      </tr>
                    </tbody>
                  </table>
                </motion.div>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex justify-between">
                  <Label htmlFor="save-preset">Save Current Theme as Preset</Label>
                  <Button
                    size="sm"
                    onClick={handleSavePreset}
                    disabled={!presetName.trim()}
                    className="bg-csv-gradient hover:bg-csv-gradient-hover"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
                <Input
                  id="save-preset"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Enter preset name"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="font-size" className="flex justify-between">
                  Font Size: {fontSize}px
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="ml-2 bg-csv-green-50 text-csv-green-700">
                          Live Preview
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Changes are applied instantly to the table preview</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Slider
                  id="font-size"
                  min={10}
                  max={18}
                  step={1}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  className="[&>[role=slider]]:bg-csv-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cell-padding">Cell Padding: {cellPadding}px</Label>
                <Slider
                  id="cell-padding"
                  min={4}
                  max={24}
                  step={2}
                  value={[cellPadding]}
                  onValueChange={(value) => setCellPadding(value[0])}
                  className="[&>[role=slider]]:bg-csv-green-500"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Border Style</Label>
              <RadioGroup value={borderStyle} onValueChange={setBorderStyle} className="flex space-x-2">
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="none" id="border-none" className="text-csv-green-500" />
                  <Label htmlFor="border-none">None</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="thin" id="border-thin" className="text-csv-green-500" />
                  <Label htmlFor="border-thin">Thin</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="medium" id="border-medium" className="text-csv-green-500" />
                  <Label htmlFor="border-medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="thick" id="border-thick" className="text-csv-green-500" />
                  <Label htmlFor="border-thick">Thick</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-center space-x-2">
                <Switch id="alternate-rows" checked={alternateRows} onCheckedChange={setAlternateRows} />
                <Label htmlFor="alternate-rows">Alternate row colors</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="highlight-hover" checked={highlightHover} onCheckedChange={setHighlightHover} />
                <Label htmlFor="highlight-hover">Highlight rows on hover</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="show-gridlines" checked={showGridlines} onCheckedChange={setShowGridlines} />
                <Label htmlFor="show-gridlines">Show gridlines</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="wrap-text" checked={wrapText} onCheckedChange={setWrapText} />
                <Label htmlFor="wrap-text">Wrap text in cells</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="truncate-text" checked={truncateText} onCheckedChange={setTruncateText} />
                <Label htmlFor="truncate-text">Truncate long text</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="show-mini-charts" checked={showMiniCharts} onCheckedChange={setShowMiniCharts} />
                <Label htmlFor="show-mini-charts">Show mini charts in cells</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="use-heatmap" checked={useHeatmap} onCheckedChange={setUseHeatmap} />
                <Label htmlFor="use-heatmap">Use heatmap for numeric values</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="show-icons" checked={showIcons} onCheckedChange={setShowIcons} />
                <Label htmlFor="show-icons">Show data type icons</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="export-format">Export Format</Label>
                <Switch id="show-preview" checked={showPreview} onCheckedChange={setShowPreview} />
                <Label htmlFor="show-preview" className="text-sm">
                  Show Preview
                </Label>
              </div>

              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Select export format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="html">HTML Table (.html)</SelectItem>
                  <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Label htmlFor="sheet-name">Sheet/Document Name</Label>
                <Input
                  id="sheet-name"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="Enter sheet or document name"
                />
              </div>

              {showPreview && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <Label>Export Preview</Label>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                      >
                        -
                      </Button>
                      <span className="mx-2 text-sm">{previewZoom}%</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-md overflow-hidden p-4 bg-white">
                    <div
                      className={`transform transition-transform origin-top-left`}
                      style={{ transform: `scale(${previewZoom / 100})` }}
                    >
                      {exportFormat === "excel" && (
                        <div className="border border-slate-200 rounded shadow-sm overflow-hidden max-w-3xl">
                          <div className="bg-green-100 p-2 flex items-center text-sm">
                            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-700" />
                            <span className="font-medium text-green-800">{sheetName || "Processed Data"}</span>
                          </div>
                          <table
                            className={cn(
                              "w-full border-collapse text-sm",
                              fontSize <= 12 ? "text-xs" : fontSize > 14 ? "text-base" : "text-sm",
                            )}
                          >
                            <thead>
                              <tr className={cn(customTheme.headerBg, customTheme.headerText)}>
                                {previewData[0].map((header, i) => (
                                  <th
                                    key={i}
                                    className={cn(
                                      showGridlines ? "border border-slate-300" : "",
                                      cellPadding <= 8 ? "p-1" : cellPadding <= 16 ? "p-2" : "p-3",
                                    )}
                                  >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {previewData.slice(1).map((row, rowIndex) => (
                                <tr
                                  key={rowIndex}
                                  className={cn(
                                    alternateRows && rowIndex % 2 === 1 ? customTheme.altRowBg : customTheme.rowBg,
                                    customTheme.text,
                                  )}
                                >
                                  {row.map((cell, cellIndex) => (
                                    <td
                                      key={cellIndex}
                                      className={cn(
                                        showGridlines ? "border border-slate-200" : "",
                                        cellPadding <= 8 ? "p-1" : cellPadding <= 16 ? "p-2" : "p-3",
                                        wrapText ? "whitespace-normal" : "whitespace-nowrap",
                                        truncateText ? "max-w-[150px] truncate" : "",
                                      )}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {exportFormat === "pdf" && (
                        <div className="bg-white shadow-md rounded-md p-6 max-w-3xl border border-slate-200">
                          <div className="text-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800">{sheetName || "Processed Data"}</h2>
                            <p className="text-xs text-slate-500 mt-1">
                              Generated on {new Date().toLocaleDateString()}
                            </p>
                          </div>
                          <table
                            className={cn(
                              "w-full border-collapse",
                              fontSize <= 12 ? "text-xs" : fontSize > 14 ? "text-base" : "text-sm",
                            )}
                          >
                            <thead>
                              <tr className="bg-slate-100">
                                {previewData[0].map((header, i) => (
                                  <th
                                    key={i}
                                    className={cn(
                                      "border-b-2 border-slate-300 font-bold text-left",
                                      cellPadding <= 8 ? "p-1" : cellPadding <= 16 ? "p-2" : "p-3",
                                    )}
                                  >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {previewData.slice(1).map((row, rowIndex) => (
                                <tr key={rowIndex} className={alternateRows && rowIndex % 2 === 1 ? "bg-slate-50" : ""}>
                                  {row.map((cell, cellIndex) => (
                                    <td
                                      key={cellIndex}
                                      className={cn(
                                        "border-b border-slate-200",
                                        cellPadding <= 8 ? "p-1" : cellPadding <= 16 ? "p-2" : "p-3",
                                        wrapText ? "whitespace-normal" : "whitespace-nowrap",
                                        truncateText ? "max-w-[150px] truncate" : "",
                                      )}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <footer className="mt-4 text-xs text-slate-500 text-right">Page 1 of 1 | Fix My CSV</footer>
                        </div>
                      )}

                      {exportFormat === "html" && (
                        <div className="bg-white shadow-md rounded-md overflow-hidden max-w-3xl border">
                          <div className="bg-slate-100 p-2 border-b flex items-center">
                            <FileCode className="h-4 w-4 mr-2 text-slate-700" />
                            <code className="text-xs text-slate-800 font-mono">&lt;html&gt;</code>
                          </div>
                          <div className="p-4">
                            <h1 className="text-xl font-bold mb-4">{sheetName || "Processed Data"}</h1>
                            <table
                              className={cn(
                                "w-full",
                                showGridlines ? "border-collapse border border-slate-300" : "border-collapse",
                                fontSize <= 12 ? "text-xs" : fontSize > 14 ? "text-base" : "text-sm",
                              )}
                            >
                              <thead>
                                <tr className={cn(customTheme.headerBg, customTheme.headerText)}>
                                  {previewData[0].map((header, i) => (
                                    <th
                                      key={i}
                                      className={cn(
                                        showGridlines ? "border border-slate-300" : "",
                                        cellPadding <= 8 ? "p-1" : cellPadding <= 16 ? "p-2" : "p-3",
                                      )}
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {previewData.slice(1).map((row, rowIndex) => (
                                  <tr
                                    key={rowIndex}
                                    className={alternateRows && rowIndex % 2 === 1 ? "bg-slate-50" : ""}
                                  >
                                    {row.map((cell, cellIndex) => (
                                      <td
                                        key={cellIndex}
                                        className={cn(
                                          showGridlines ? "border border-slate-300" : "",
                                          cellPadding <= 8 ? "p-1" : cellPadding <= 16 ? "p-2" : "p-3",
                                          wrapText ? "whitespace-normal" : "whitespace-nowrap",
                                          truncateText ? "max-w-[150px] truncate" : "",
                                        )}
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="bg-slate-100 p-2 border-t flex items-center">
                            <code className="text-xs text-slate-800 font-mono">&lt;/html&gt;</code>
                          </div>
                        </div>
                      )}

                      {exportFormat === "csv" && (
                        <div className="bg-white shadow-md rounded-md overflow-hidden max-w-3xl border">
                          <div className="bg-slate-100 p-2 border-b flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-slate-700" />
                              <span className="text-sm text-slate-800 font-medium">
                                {sheetName || "processed_data"}.csv
                              </span>
                            </div>
                            <Badge variant="outline" className="bg-slate-200 text-slate-800">
                              Plain text
                            </Badge>
                          </div>
                          <div className="p-4 font-mono text-sm whitespace-pre overflow-x-auto bg-slate-50">
                            {previewData.map((row, i) => (
                              <div key={i} className="py-1">
                                {row.join(",")}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <div className="bg-muted/40 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Format Details</h3>
                  {exportFormat === "excel" && (
                    <p className="text-sm text-muted-foreground">
                      Excel export preserves all styling, formulas, and data types. Includes all visual customizations
                      you've applied.
                    </p>
                  )}
                  {exportFormat === "csv" && (
                    <p className="text-sm text-muted-foreground">
                      CSV export preserves data only. No styling or formulas will be included in the export, but the
                      data processing changes are preserved.
                    </p>
                  )}
                  {exportFormat === "html" && (
                    <p className="text-sm text-muted-foreground">
                      HTML export includes table styling and formatting. Can be opened in any web browser or embedded in
                      websites.
                    </p>
                  )}
                  {exportFormat === "pdf" && (
                    <p className="text-sm text-muted-foreground">
                      PDF export creates a print-ready document with all styling. Perfect for sharing with users who
                      don't have spreadsheet software.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="include-styling" defaultChecked />
                    <Label htmlFor="include-styling">Include custom styling</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="include-headers" defaultChecked />
                    <Label htmlFor="include-headers">Include headers and footers</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="include-metadata" defaultChecked />
                    <Label htmlFor="include-metadata">Include metadata (date, file info)</Label>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-csv-gradient hover:bg-csv-gradient-hover flex items-center justify-center"
                onClick={handleExport}
              >
                {getExportIcon(exportFormat)}
                Export as {getExportFormatName(exportFormat)}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Helper function to get export format full name
function getExportFormatName(format: string): string {
  switch (format) {
    case "excel":
      return "Excel (.xlsx)"
    case "csv":
      return "CSV (.csv)"
    case "html":
      return "HTML (.html)"
    case "pdf":
      return "PDF (.pdf)"
    default:
      return "File"
  }
}

