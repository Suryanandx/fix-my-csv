import { detectColumnTypes } from "./csv-parser"

interface ProcessOptions {
  removeEmptyRows: boolean
  removeEmptyColumns: boolean
  standardizeDates: boolean
  removeDuplicates: boolean
  formatCurrencies: boolean
  formatPhoneNumbers: boolean
  trimWhitespace: boolean
  fixEncoding: boolean
  evaluateFormulas: boolean
  normalizeCase: boolean
  detectOutliers: boolean
  fixInvalidDates: boolean
  convertToNumbers: boolean
}

export const DEFAULT_PROCESS_OPTIONS: ProcessOptions = {
  removeEmptyRows: true,
  removeEmptyColumns: false,
  standardizeDates: true,
  removeDuplicates: true,
  formatCurrencies: true,
  formatPhoneNumbers: true,
  trimWhitespace: true,
  fixEncoding: true,
  evaluateFormulas: true,
  normalizeCase: false,
  detectOutliers: false,
  fixInvalidDates: true,
  convertToNumbers: true,
}

export function processCSV(data: string[][], options: Partial<ProcessOptions> = {}): string[][] {
  if (!data.length) return []

  // Merge default options with provided options
  const processOptions: ProcessOptions = { ...DEFAULT_PROCESS_OPTIONS, ...options }

  // Keep the header row
  const headers = data[0]
  let rows = data.slice(1)

  // Detect column types for intelligent processing
  const columnTypes = detectColumnTypes(data)

  // Process the data based on selected options
  if (processOptions.trimWhitespace) {
    rows = trimWhitespace(rows)
  }

  if (processOptions.fixEncoding) {
    rows = fixEncoding(rows)
  }

  if (processOptions.removeEmptyRows) {
    rows = removeEmptyRows(rows)
  }

  if (processOptions.removeEmptyColumns) {
    const result = removeEmptyColumns(headers, rows)
    headers.splice(0, headers.length, ...result.headers)
    rows = result.rows
  }

  if (processOptions.standardizeDates) {
    rows = standardizeDates(headers, rows, columnTypes)
  }

  if (processOptions.fixInvalidDates) {
    rows = fixInvalidDates(headers, rows, columnTypes)
  }

  if (processOptions.removeDuplicates) {
    rows = removeDuplicates(rows)
  }

  if (processOptions.formatCurrencies) {
    rows = formatCurrencies(headers, rows, columnTypes)
  }

  if (processOptions.formatPhoneNumbers) {
    rows = formatPhoneNumbers(headers, rows, columnTypes)
  }

  if (processOptions.evaluateFormulas) {
    rows = evaluateFormulas(headers, rows, columnTypes)
  }

  if (processOptions.normalizeCase) {
    rows = normalizeCase(headers, rows, columnTypes)
  }

  if (processOptions.convertToNumbers) {
    rows = convertToNumbers(headers, rows, columnTypes)
  }

  if (processOptions.detectOutliers) {
    rows = detectAndMarkOutliers(headers, rows, columnTypes)
  }

  // Return the processed data with headers
  return [headers, ...rows]
}

// Trim whitespace from all cells
function trimWhitespace(rows: string[][]): string[][] {
  return rows.map((row) => row.map((cell) => cell.trim()))
}

// Fix common encoding issues
function fixEncoding(rows: string[][]): string[][] {
  return rows.map((row) =>
    row.map((cell) => {
      // Replace common problematic characters
      return cell
        .replace(/â€™/g, "'")
        .replace(/â€œ/g, '"')
        .replace(/â€/g, '"')
        .replace(/Â/g, "")
        .replace(/Ã©/g, "é")
        .replace(/Ã¨/g, "è")
        .replace(/Ã¢/g, "â")
        .replace(/Ã®/g, "î")
        .replace(/Ã´/g, "ô")
        .replace(/Ã»/g, "û")
    }),
  )
}

// Remove rows that are completely empty or only contain whitespace
function removeEmptyRows(rows: string[][]): string[][] {
  return rows.filter((row) => {
    return row.some((cell) => cell.trim() !== "")
  })
}

// Remove columns that are completely empty
function removeEmptyColumns(headers: string[], rows: string[][]): { headers: string[]; rows: string[][] } {
  const columnsToKeep: number[] = []

  // Check each column
  for (let colIndex = 0; colIndex < headers.length; colIndex++) {
    const hasData = rows.some((row) => {
      return row[colIndex] && row[colIndex].trim() !== ""
    })

    if (hasData || headers[colIndex].trim() !== "") {
      columnsToKeep.push(colIndex)
    }
  }

  // Filter headers and rows to keep only non-empty columns
  const newHeaders = columnsToKeep.map((colIndex) => headers[colIndex])
  const newRows = rows.map((row) => columnsToKeep.map((colIndex) => row[colIndex] || ""))

  return { headers: newHeaders, rows: newRows }
}

// Standardize date formats to YYYY-MM-DD
function standardizeDates(headers: string[], rows: string[][], columnTypes: string[]): string[][] {
  // Find columns that contain dates
  const dateColumnIndexes = columnTypes
    .map((type, index) => (type === "date" ? index : -1))
    .filter((index) => index !== -1)

  if (dateColumnIndexes.length === 0) return rows

  return rows.map((row) => {
    return row.map((cell, cellIndex) => {
      if (dateColumnIndexes.includes(cellIndex) && cell.trim() !== "") {
        return standardizeDateFormat(cell)
      }
      return cell
    })
  })
}

// Fix invalid dates (like 1000-01-01 or 0999-12-31)
function fixInvalidDates(headers: string[], rows: string[][], columnTypes: string[]): string[][] {
  // Find columns that contain dates
  const dateColumnIndexes = columnTypes
    .map((type, index) => (type === "date" ? index : -1))
    .filter((index) => index !== -1)

  if (dateColumnIndexes.length === 0) return rows

  const currentYear = new Date().getFullYear()

  return rows.map((row) => {
    return row.map((cell, cellIndex) => {
      if (dateColumnIndexes.includes(cellIndex) && cell.trim() !== "") {
        // Try to parse the date
        const dateParts = cell.split(/[-/]/)
        if (dateParts.length === 3) {
          let year = Number.parseInt(dateParts[0], 10)
          const month = Number.parseInt(dateParts[1], 10)
          const day = Number.parseInt(dateParts[2], 10)

          // Fix obviously wrong years
          if (year < 1900 || year > currentYear + 100) {
            // If it looks like 0999, it's probably 1999
            if (year < 1000 && year > 500) {
              year += 1000
            }
            // If it's a future date beyond reasonable, cap it
            else if (year > currentYear + 100) {
              year = currentYear
            }
            // If it's too old, use a reasonable default
            else if (year < 1900) {
              year = 1900
            }

            return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
          }
        }
      }
      return cell
    })
  })
}

function standardizeDateFormat(dateStr: string): string {
  // Handle various date formats

  // Remove any extra whitespace
  dateStr = dateStr.trim()

  // Try to parse the date string
  let date: Date | null = null

  // Check for DD/MM/YYYY or MM/DD/YYYY format
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/")
    if (parts.length === 3) {
      // Assume MM/DD/YYYY for US format
      if (Number.parseInt(parts[0]) <= 12) {
        date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`)
      }
      // Try DD/MM/YYYY for international format
      else {
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
      }
    }
  }
  // Check for DD-MM-YYYY or YYYY-MM-DD format
  else if (dateStr.includes("-")) {
    const parts = dateStr.split("-")
    if (parts.length === 3) {
      // If first part is 4 digits, assume YYYY-MM-DD
      if (parts[0].length === 4) {
        date = new Date(dateStr)
      }
      // Otherwise assume DD-MM-YYYY
      else {
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
      }
    }
  }
  // Try direct parsing for other formats
  else {
    date = new Date(dateStr)
  }

  // Check if the date is valid
  if (date && !isNaN(date.getTime())) {
    // Format as YYYY-MM-DD
    return date.toISOString().split("T")[0]
  }

  // If we can't parse it, return the original string
  return dateStr
}

// Remove duplicate rows
function removeDuplicates(rows: string[][]): string[][] {
  const uniqueRows = new Map<string, string[]>()

  rows.forEach((row) => {
    const key = row.join("|")
    if (!uniqueRows.has(key)) {
      uniqueRows.set(key, row)
    }
  })

  return Array.from(uniqueRows.values())
}

// Format currency values
function formatCurrencies(headers: string[], rows: string[][], columnTypes: string[]): string[][] {
  // Find columns that contain currency values
  const currencyColumnIndexes = columnTypes
    .map((type, index) => (type === "currency" ? index : -1))
    .filter((index) => index !== -1)

  if (currencyColumnIndexes.length === 0) return rows

  return rows.map((row) => {
    return row.map((cell, cellIndex) => {
      if (currencyColumnIndexes.includes(cellIndex) && cell.trim() !== "") {
        return formatCurrencyValue(cell)
      }
      return cell
    })
  })
}

function formatCurrencyValue(value: string): string {
  // Detect currency symbol
  let currencySymbol = "$"
  if (value.includes("€")) currencySymbol = "€"
  else if (value.includes("£")) currencySymbol = "£"
  else if (value.includes("¥")) currencySymbol = "¥"
  else if (value.includes("₹")) currencySymbol = "₹"

  // Remove any non-numeric characters except decimal point
  const numericValue = value.replace(/[^\d.-]/g, "")

  // Try to parse as a number
  const num = Number.parseFloat(numericValue)

  // Check if it's a valid number
  if (!isNaN(num)) {
    // Format with 2 decimal places and add currency symbol
    return `${currencySymbol}${num.toFixed(2)}`
  }

  // If we can't parse it, return the original string
  return value
}

// Format phone numbers to a consistent format
function formatPhoneNumbers(headers: string[], rows: string[][], columnTypes: string[]): string[][] {
  // Find columns that contain phone numbers
  const phoneColumnIndexes = columnTypes
    .map((type, index) => (type === "phone" ? index : -1))
    .filter((index) => index !== -1)

  if (phoneColumnIndexes.length === 0) return rows

  return rows.map((row) => {
    return row.map((cell, cellIndex) => {
      if (phoneColumnIndexes.includes(cellIndex) && cell.trim() !== "") {
        return formatPhoneNumber(cell)
      }
      return cell
    })
  })
}

function formatPhoneNumber(phoneStr: string): string {
  // Remove all non-numeric characters
  const digits = phoneStr.replace(/\D/g, "")

  // Check for country code
  let countryCode = ""
  let nationalNumber = digits

  // Extract country code if present
  if (digits.length > 10) {
    if (digits.startsWith("1") && digits.length === 11) {
      // US/Canada number
      countryCode = "+1"
      nationalNumber = digits.substring(1)
    } else if (digits.startsWith("91") && digits.length === 12) {
      // India number
      countryCode = "+91"
      nationalNumber = digits.substring(2)
    } else {
      // Other international number - assume first 1-3 digits are country code
      countryCode = `+${digits.substring(0, Math.min(3, digits.length - 10))}`
      nationalNumber = digits.substring(Math.min(3, digits.length - 10))
    }
  }

  // Format the national number part
  if (nationalNumber.length === 10) {
    return `${countryCode} (${nationalNumber.substring(0, 3)}) ${nationalNumber.substring(3, 6)}-${nationalNumber.substring(6)}`
  }

  // If it doesn't match the expected format, return with just spaces for readability
  if (digits.length > 4) {
    return `${countryCode} ${digits.replace(/(\d{3})(?=\d)/g, "$1 ")}`.trim()
  }

  // If all else fails, return the original
  return phoneStr
}

// Evaluate mathematical formulas in cells
function evaluateFormulas(headers: string[], rows: string[][], columnTypes: string[]): string[][] {
  // Find columns that might contain formulas
  const formulaColumnIndexes = columnTypes
    .map((type, index) => (type === "formula" ? index : -1))
    .filter((index) => index !== -1)

  if (formulaColumnIndexes.length === 0) return rows

  // Create a map of cell references
  const cellValues = new Map<string, number>()

  // First pass: collect all numeric values
  rows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (isNumeric(cell)) {
        const cellRef = getCellReference(rowIndex, colIndex)
        cellValues.set(cellRef, Number.parseFloat(cell))
      }
    })
  })

  // Second pass: evaluate formulas
  return rows.map((row, rowIndex) => {
    return row.map((cell, colIndex) => {
      if (formulaColumnIndexes.includes(colIndex) && cell.trim() !== "" && cell.startsWith("=")) {
        try {
          return evaluateFormula(cell, cellValues, headers, rows)
        } catch (error) {
          console.error(`Error evaluating formula ${cell}:`, error)
          return cell // Return original if evaluation fails
        }
      }
      return cell
    })
  })
}

function isNumeric(value: string): boolean {
  return !isNaN(Number.parseFloat(value)) && isFinite(Number(value.replace(/[$,]/g, "")))
}

function getCellReference(rowIndex: number, colIndex: number): string {
  const colLetter = String.fromCharCode(65 + colIndex) // A, B, C, etc.
  return `${colLetter}${rowIndex + 1}`
}

function evaluateFormula(
  formula: string,
  cellValues: Map<string, number>,
  headers: string[],
  rows: string[][],
): string {
  // Remove the leading equals sign
  let expression = formula.substring(1)

  // Replace cell references with their values
  const cellRefPattern = /[A-Z]+\d+/g
  expression = expression.replace(cellRefPattern, (match) => {
    const value = cellValues.get(match)
    return value !== undefined ? value.toString() : "0"
  })

  // Handle common functions
  expression = expression
    .replace(/SUM$$([^)]+)$$/gi, (_, range) => {
      const parts = range.split(":")
      if (parts.length === 2) {
        // Parse range like A1:A5
        const startCell = parseCellReference(parts[0])
        const endCell = parseCellReference(parts[1])

        let sum = 0
        for (let r = startCell.row; r <= endCell.row; r++) {
          for (let c = startCell.col; c <= endCell.col; c++) {
            const cellValue = rows[r]?.[c]
            if (cellValue && isNumeric(cellValue)) {
              sum += Number.parseFloat(cellValue)
            }
          }
        }
        return sum.toString()
      }
      return "0"
    })
    .replace(/AVG$$([^)]+)$$/gi, (_, range) => {
      const parts = range.split(":")
      if (parts.length === 2) {
        const startCell = parseCellReference(parts[0])
        const endCell = parseCellReference(parts[1])

        let sum = 0
        let count = 0
        for (let r = startCell.row; r <= endCell.row; r++) {
          for (let c = startCell.col; c <= endCell.col; c++) {
            const cellValue = rows[r]?.[c]
            if (cellValue && isNumeric(cellValue)) {
              sum += Number.parseFloat(cellValue)
              count++
            }
          }
        }
        return count > 0 ? (sum / count).toString() : "0"
      }
      return "0"
    })

  // Evaluate the expression
  try {
    // Use Function constructor to evaluate the expression safely
    const result = new Function(`return ${expression}`)()

    // Format the result
    if (typeof result === "number") {
      return result.toString()
    }
    return result
  } catch (error) {
    console.error(`Failed to evaluate expression: ${expression}`, error)
    return formula // Return the original formula if evaluation fails
  }
}

function parseCellReference(ref: string): { row: number; col: number } {
  const match = ref.match(/([A-Z]+)(\d+)/)
  if (!match) return { row: 0, col: 0 }

  const colStr = match[1]
  const rowStr = match[2]

  // Convert column letters to index (A=0, B=1, etc.)
  let colIndex = 0
  for (let i = 0; i < colStr.length; i++) {
    colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64)
  }

  // Convert to 0-based index
  return {
    row: Number.parseInt(rowStr, 10) - 1,
    col: colIndex - 1,
  }
}

// Normalize case (UPPER, lower, Title Case) based on column type
function normalizeCase(headers: string[], rows: string[][], columnTypes: string[]): string[][] {
  return rows.map((row) => {
    return row.map((cell, colIndex) => {
      if (!cell.trim()) return cell

      const type = columnTypes[colIndex]

      // Apply case formatting based on column type
      if (type === "text") {
        // For text columns, convert to Title Case
        return cell.replace(/\w\S*/g, (txt) => {
          return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        })
      } else if (headers[colIndex]?.toLowerCase().includes("name")) {
        // For name columns, use Title Case
        return cell.replace(/\w\S*/g, (txt) => {
          return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        })
      } else if (headers[colIndex]?.toLowerCase().includes("code") || headers[colIndex]?.toLowerCase().includes("id")) {
        // For code/ID columns, use UPPERCASE
        return cell.toUpperCase()
      }

      return cell
    })
  })
}

// Convert string numbers to actual numbers for numeric columns
function convertToNumbers(headers: string[], rows: string[][], columnTypes: string[]): string[][] {
  // Find columns that contain numeric values
  const numericColumnIndexes = columnTypes
    .map((type, index) => (type === "number" || type === "currency" ? index : -1))
    .filter((index) => index !== -1)

  if (numericColumnIndexes.length === 0) return rows

  return rows.map((row) => {
    return row.map((cell, colIndex) => {
      if (numericColumnIndexes.includes(colIndex) && cell.trim() !== "") {
        // Extract numeric value
        const numericValue = cell.replace(/[^\d.-]/g, "")

        // Try to parse as a number
        const num = Number.parseFloat(numericValue)

        // If it's a valid number, format it consistently
        if (!isNaN(num)) {
          if (columnTypes[colIndex] === "currency") {
            // Keep the currency symbol if present
            const currencySymbol = cell.match(/[$€£¥₹]/)?.[0] || "$"
            return `${currencySymbol}${num.toFixed(2)}`
          } else {
            // For regular numbers, just return the formatted number
            return num.toString()
          }
        }
      }
      return cell
    })
  })
}

// Detect and mark statistical outliers in numeric columns
function detectAndMarkOutliers(headers: string[], rows: string[][], columnTypes: string[]): string[][] {
  // Find columns that contain numeric values
  const numericColumnIndexes = columnTypes
    .map((type, index) => (type === "number" || type === "currency" ? index : -1))
    .filter((index) => index !== -1)

  if (numericColumnIndexes.length === 0) return rows

  // For each numeric column, calculate mean and standard deviation
  const stats = numericColumnIndexes.reduce(
    (acc, colIndex) => {
      const values = rows
        .map((row) => {
          const numericValue = row[colIndex]?.replace(/[^\d.-]/g, "")
          return numericValue ? Number.parseFloat(numericValue) : null
        })
        .filter((val): val is number => val !== null && !isNaN(val))

      if (values.length === 0) {
        acc[colIndex] = { mean: 0, stdDev: 0 }
        return acc
      }

      // Calculate mean
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length

      // Calculate standard deviation
      const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
      const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
      const stdDev = Math.sqrt(variance)

      acc[colIndex] = { mean, stdDev }
      return acc
    },
    {} as Record<number, { mean: number; stdDev: number }>,
  )

  // Mark outliers in the data
  return rows.map((row) => {
    return row.map((cell, colIndex) => {
      if (numericColumnIndexes.includes(colIndex) && cell.trim() !== "") {
        const numericValue = cell.replace(/[^\d.-]/g, "")
        const num = Number.parseFloat(numericValue)

        if (!isNaN(num) && stats[colIndex]) {
          const { mean, stdDev } = stats[colIndex]

          // Check if the value is an outlier (more than 2 standard deviations from the mean)
          if (stdDev > 0 && Math.abs(num - mean) > 2 * stdDev) {
            // Mark as outlier but preserve the original value
            return `${cell} [OUTLIER]`
          }
        }
      }
      return cell
    })
  })
}

