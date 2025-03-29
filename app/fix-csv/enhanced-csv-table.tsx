"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp, Filter, ArrowUpDown, Pencil, Save, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface EnhancedCsvTableProps {
  data: string[][]
  onSort?: (columnIndex: number, direction: "asc" | "desc") => void
  onFilter?: (columnIndex: number, value: string) => void
  highlightChanges?: boolean
  originalData?: string[][]
  isLoading?: boolean
  onCellEdit?: (rowIndex: number, colIndex: number, value: string) => void
  displayOptions?: {
    fontSize?: number
    cellPadding?: number
    borderStyle?: string
    alternateRows?: boolean
    highlightHover?: boolean
    showGridlines?: boolean
    wrapText?: boolean
    truncateText?: boolean
    showMiniCharts?: boolean
    useHeatmap?: boolean
    showIcons?: boolean
  }
  columnTypes?: string[]
}

export function EnhancedCsvTable({
  data,
  onSort,
  onFilter,
  highlightChanges = false,
  originalData,
  isLoading = false,
  onCellEdit,
  displayOptions = {},
  columnTypes = [],
}: EnhancedCsvTableProps) {
  const [sortConfig, setSortConfig] = useState<{ columnIndex: number; direction: "asc" | "desc" } | null>(null)
  const [filters, setFilters] = useState<Record<number, string>>({})
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editValue, setEditValue] = useState<string>("")

  // Default display options
  const {
    fontSize = 14,
    cellPadding = 16,
    borderStyle = "thin",
    alternateRows = true,
    highlightHover = true,
    showGridlines = true,
    wrapText = false,
    truncateText = true,
    showMiniCharts = false,
    useHeatmap = false,
    showIcons = true,
  } = displayOptions

  if (!data.length)
    return <div className="flex items-center justify-center h-40 text-muted-foreground">No data available</div>

  const headers = data[0]
  const rows = data.slice(1)

  // Generate sparkline data for numeric columns
  const sparklineData = useMemo(() => {
    const result: Record<number, number[]> = {}

    if (showMiniCharts) {
      // Check each column
      headers.forEach((_, colIndex) => {
        // Check if this is a numeric column
        const isNumeric = rows.some((row) => {
          const val = row[colIndex]
          if (!val) return false
          const num = Number.parseFloat(val.replace(/[^\d.-]/g, ""))
          return !isNaN(num)
        })

        if (isNumeric) {
          result[colIndex] = rows
            .map((row) => {
              const val = row[colIndex]
              if (!val) return 0
              const num = Number.parseFloat(val.replace(/[^\d.-]/g, ""))
              return isNaN(num) ? 0 : num
            })
            .filter((n) => !isNaN(n))
        }
      })
    }

    return result
  }, [data, showMiniCharts, headers, rows])

  // Generate heatmap colors for numeric columns
  const getHeatmapColor = (value: string, colIndex: number) => {
    if (!useHeatmap) return ""

    // Skip if sparkline data doesn't exist for this column
    if (!sparklineData[colIndex]) return ""

    const num = Number.parseFloat(value.replace(/[^\d.-]/g, ""))
    if (isNaN(num)) return ""

    const values = sparklineData[colIndex]
    if (!values || values.length === 0) return ""

    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min

    if (range === 0) return "bg-blue-50 dark:bg-blue-900/20"

    const normalizedValue = (num - min) / range

    // Create a color gradient from blue to red
    if (normalizedValue < 0.2) return "bg-blue-50 dark:bg-blue-900/20"
    if (normalizedValue < 0.4) return "bg-cyan-50 dark:bg-cyan-900/20"
    if (normalizedValue < 0.6) return "bg-green-50 dark:bg-green-900/20"
    if (normalizedValue < 0.8) return "bg-yellow-50 dark:bg-yellow-900/30"
    return "bg-red-50 dark:bg-red-900/30"
  }

  const handleSort = (columnIndex: number) => {
    let direction: "asc" | "desc" = "asc"

    if (sortConfig?.columnIndex === columnIndex) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc"
    }

    setSortConfig({ columnIndex, direction })

    if (onSort) {
      onSort(columnIndex, direction)
    }
  }

  const handleFilter = (columnIndex: number, value: string) => {
    const newFilters = { ...filters }

    if (value) {
      newFilters[columnIndex] = value
    } else {
      delete newFilters[columnIndex]
    }

    setFilters(newFilters)

    if (onFilter) {
      onFilter(columnIndex, value)
    }
  }

  // Cell editing
  const handleCellClick = (rowIndex: number, colIndex: number, currentValue: string) => {
    if (onCellEdit) {
      setEditingCell({ row: rowIndex, col: colIndex })
      setEditValue(currentValue)
    }
  }

  const handleCellEdit = () => {
    if (editingCell && onCellEdit) {
      onCellEdit(editingCell.row, editingCell.col, editValue)
      setEditingCell(null)
    }
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue("")
  }

  // Check if a cell has changed compared to original data
  const hasCellChanged = (rowIndex: number, colIndex: number): boolean => {
    if (!highlightChanges || !originalData || originalData.length < 2) return false

    // Add 1 to rowIndex because we're comparing with data that includes headers
    const originalRow = originalData[rowIndex + 1]
    const currentValue = rows[rowIndex][colIndex]

    return originalRow && originalRow[colIndex] !== currentValue
  }

  // Get cell tooltip content
  const getCellTooltip = (rowIndex: number, colIndex: number): string | null => {
    if (!highlightChanges || !originalData || originalData.length < 2) return null

    // Add 1 to rowIndex because we're comparing with data that includes headers
    const originalRow = originalData[rowIndex + 1]

    if (originalRow && hasCellChanged(rowIndex, colIndex)) {
      return `Original: ${originalRow[colIndex] || "(empty)"}`
    }

    return null
  }

  // Get icon for column type
  const getColumnTypeIcon = (colIndex: number) => {
    if (!showIcons || !columnTypes || !columnTypes[colIndex]) return null

    const type = columnTypes[colIndex]

    switch (type) {
      case "date":
        return <span className="text-xs text-blue-600 dark:text-blue-400">📅</span>
      case "number":
        return <span className="text-xs text-green-600 dark:text-green-400">#</span>
      case "currency":
        return <span className="text-xs text-green-600 dark:text-green-400">💲</span>
      case "phone":
        return <span className="text-xs text-purple-600 dark:text-purple-400">📞</span>
      case "formula":
        return <span className="text-xs text-amber-600 dark:text-amber-400">📊</span>
      default:
        return null
    }
  }

  // Generate classes for the table based on display options
  const tableClasses = cn("w-full caption-bottom text-sm", {
    "border-collapse": borderStyle !== "none",
    "border-separate": borderStyle === "none",
  })

  const cellClasses = cn("align-middle transition-colors", {
    border: showGridlines && borderStyle !== "none",
    "border-muted-foreground/20": showGridlines && borderStyle === "thin",
    "border-muted-foreground/30": showGridlines && borderStyle === "medium",
    "border-muted-foreground/40": showGridlines && borderStyle === "thick",
    "whitespace-nowrap": !wrapText,
    "overflow-hidden": truncateText,
    "text-xs": fontSize <= 12,
    "text-sm": fontSize > 12 && fontSize <= 14,
    "text-base": fontSize > 14 && fontSize <= 16,
    "text-lg": fontSize > 16,
    "p-1": cellPadding <= 8,
    "p-2": cellPadding > 8 && cellPadding <= 12,
    "p-3": cellPadding > 12 && cellPadding <= 16,
    "p-4": cellPadding > 16,
  })

  return (
    <div className="w-full overflow-auto">
      <table className={tableClasses}>
        <thead>
          <tr className="border-b transition-colors hover:bg-muted/50">
            {headers.map((header, index) => (
              <th key={index} className={cn(cellClasses, "h-10 text-left font-medium text-muted-foreground")}>
                <div className="flex items-center space-x-1">
                  {getColumnTypeIcon(index)}
                  <span className={cn("flex-1", truncateText ? "truncate max-w-[150px]" : "")} title={header}>
                    {header}
                  </span>

                  {onSort && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleSort(index)}>
                      {sortConfig?.columnIndex === index ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                      <span className="sr-only">Sort</span>
                    </Button>
                  )}

                  {onFilter && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("h-8 w-8 p-0", filters[index] ? "text-primary" : "text-muted-foreground")}
                        >
                          <Filter className="h-4 w-4" />
                          <span className="sr-only">Filter</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">Filter {header}</h4>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Filter value"
                              value={filters[index] || ""}
                              onChange={(e) => handleFilter(index, e.target.value)}
                            />
                            <Button size="sm" variant="ghost" onClick={() => handleFilter(index, "")}>
                              Clear
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={cn(isLoading && "opacity-50")}>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                "transition-colors",
                highlightHover && "hover:bg-muted/50",
                alternateRows && rowIndex % 2 === 1 && "bg-muted/30",
              )}
            >
              {row.map((cell, cellIndex) => {
                const tooltip = getCellTooltip(rowIndex, cellIndex)
                const isChanged = hasCellChanged(rowIndex, cellIndex)
                const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === cellIndex
                const isEditing = editingCell?.row === rowIndex && editingCell?.col === cellIndex
                const heatmapColor = getHeatmapColor(cell, cellIndex)

                // Determine if cell has sparkline
                const hasSparkline = showMiniCharts && sparklineData[cellIndex] && sparklineData[cellIndex].length > 0

                return (
                  <td
                    key={cellIndex}
                    className={cn(
                      cellClasses,
                      isChanged && "bg-yellow-50 dark:bg-yellow-950",
                      isHovered && "bg-muted",
                      heatmapColor,
                    )}
                    onMouseEnter={() => setHoveredCell({ row: rowIndex, col: cellIndex })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => !isEditing && handleCellClick(rowIndex, cellIndex, cell)}
                  >
                    {tooltip ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full h-full">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="h-8 py-1 px-2"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleCellEdit()
                                      if (e.key === "Escape") cancelEdit()
                                    }}
                                  />
                                  <Button size="icon" className="h-7 w-7" variant="ghost" onClick={handleCellEdit}>
                                    <Save className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="icon" className="h-7 w-7" variant="ghost" onClick={cancelEdit}>
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="group flex items-center gap-2">
                                  <div className="flex flex-col flex-1">
                                    <span
                                      className={cn(
                                        truncateText ? "truncate max-w-[200px]" : "",
                                        wrapText ? "whitespace-normal break-words" : "",
                                      )}
                                      title={cell}
                                    >
                                      {cell}
                                    </span>

                                    {hasSparkline && (
                                      <div className="h-4 w-16 relative">
                                        <div className="absolute inset-0">
                                          <SimpleMiniChart data={sparklineData[cellIndex]} />
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {onCellEdit && (
                                    <Button
                                      size="icon"
                                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleCellClick(rowIndex, cellIndex, cell)
                                      }}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                  )}

                                  {isChanged && (
                                    <Badge
                                      variant="outline"
                                      className="h-5 px-1 text-xs bg-yellow-100 dark:bg-yellow-900"
                                    >
                                      Changed
                                    </Badge>
                                  )}

                                  {cell.includes("[OUTLIER]") && (
                                    <Badge variant="outline" className="h-5 px-1 text-xs bg-red-100 dark:bg-red-900">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      Outlier
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-8 py-1 px-2"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleCellEdit()
                                if (e.key === "Escape") cancelEdit()
                              }}
                            />
                            <Button size="icon" className="h-7 w-7" variant="ghost" onClick={handleCellEdit}>
                              <Save className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" className="h-7 w-7" variant="ghost" onClick={cancelEdit}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="group flex items-center gap-2">
                            <div className="flex flex-col flex-1">
                              <span
                                className={cn(
                                  truncateText ? "truncate max-w-[200px]" : "",
                                  wrapText ? "whitespace-normal break-words" : "",
                                )}
                                title={cell}
                              >
                                {cell}
                              </span>

                              {hasSparkline && (
                                <div className="h-4 w-16 relative">
                                  <div className="absolute inset-0">
                                    <SimpleMiniChart data={sparklineData[cellIndex]} />
                                  </div>
                                </div>
                              )}
                            </div>

                            {onCellEdit && (
                              <Button
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCellClick(rowIndex, cellIndex, cell)
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            )}

                            {isChanged && (
                              <Badge variant="outline" className="h-5 px-1 text-xs bg-yellow-100 dark:bg-yellow-900">
                                Changed
                              </Badge>
                            )}

                            {cell.includes("[OUTLIER]") && (
                              <Badge variant="outline" className="h-5 px-1 text-xs bg-red-100 dark:bg-red-900">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Outlier
                              </Badge>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Simple mini chart implementation that doesn't rely on external libraries
function SimpleMiniChart({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  // Normalize data to 0-1 range
  const normalizedData = data.map((val) => (val - min) / range)

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${data.length} 1`} preserveAspectRatio="none">
      {/* Line */}
      <polyline
        points={normalizedData.map((val, i) => `${i},${1 - val}`).join(" ")}
        fill="none"
        stroke="rgb(59, 130, 246)"
        strokeWidth="0.1"
      />

      {/* Dots for first and last points */}
      <circle cx="0" cy={1 - normalizedData[0]} r="0.1" fill="rgb(59, 130, 246)" />
      <circle
        cx={data.length - 1}
        cy={1 - normalizedData[normalizedData.length - 1]}
        r="0.1"
        fill="rgb(59, 130, 246)"
      />
    </svg>
  )
}

