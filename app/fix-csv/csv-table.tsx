"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Filter, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CsvTableProps {
  data: string[][]
  onSort?: (columnIndex: number, direction: "asc" | "desc") => void
  onFilter?: (columnIndex: number, value: string) => void
  highlightChanges?: boolean
  originalData?: string[][]
  isLoading?: boolean
}

export function CsvTable({
  data,
  onSort,
  onFilter,
  highlightChanges = false,
  originalData,
  isLoading = false,
}: CsvTableProps) {
  const [sortConfig, setSortConfig] = useState<{ columnIndex: number; direction: "asc" | "desc" } | null>(null)
  const [filters, setFilters] = useState<Record<number, string>>({})
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)

  if (!data.length)
    return <div className="flex items-center justify-center h-40 text-muted-foreground">No data available</div>

  const headers = data[0]
  const rows = data.slice(1)

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

  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b transition-colors hover:bg-muted/50">
            {headers.map((header, index) => (
              <th key={index} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <span className="flex-1 truncate max-w-[150px]" title={header}>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("h-8 w-8 p-0", filters[index] ? "text-primary" : "text-muted-foreground")}
                      onClick={() => {
                        const value = prompt(`Filter ${header} (leave empty to clear):`, filters[index] || "")
                        if (value !== null) {
                          handleFilter(index, value)
                        }
                      }}
                    >
                      <Filter className="h-4 w-4" />
                      <span className="sr-only">Filter</span>
                    </Button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={cn(isLoading && "opacity-50")}>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b transition-colors hover:bg-muted/50">
              {row.map((cell, cellIndex) => {
                const tooltip = getCellTooltip(rowIndex, cellIndex)
                const isChanged = hasCellChanged(rowIndex, cellIndex)
                const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === cellIndex

                const cellContent = (
                  <td
                    key={cellIndex}
                    className={cn(
                      "p-4 align-middle transition-colors",
                      isChanged && "bg-yellow-50 dark:bg-yellow-950",
                      isHovered && "bg-muted",
                    )}
                    onMouseEnter={() => setHoveredCell({ row: rowIndex, col: cellIndex })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[200px]" title={cell}>
                        {cell}
                      </span>

                      {isChanged && (
                        <Badge variant="outline" className="h-5 px-1 text-xs bg-yellow-100 dark:bg-yellow-900">
                          Changed
                        </Badge>
                      )}

                      {cell.includes("[OUTLIER]") && (
                        <Badge variant="outline" className="h-5 px-1 text-xs bg-red-100 dark:bg-red-900">
                          Outlier
                        </Badge>
                      )}
                    </div>
                  </td>
                )

                return tooltip ? (
                  <TooltipProvider key={cellIndex}>
                    <Tooltip>
                      <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
                      <TooltipContent>
                        <p>{tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  cellContent
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

