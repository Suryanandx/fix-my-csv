/**
 * Advanced CSV parsing and processing utilities
 */

// Parse CSV string into a 2D array with proper handling of quoted fields
export function parseCSV(text: string): string[][] {
  if (!text) return []

  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    // Handle quoted fields
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Double quotes inside a quoted field - add a single quote
        currentField += '"'
        i++ // Skip the next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes
      }
    }
    // Handle commas
    else if (char === "," && !inQuotes) {
      currentRow.push(currentField.trim())
      currentField = ""
    }
    // Handle newlines
    else if ((char === "\n" || (char === "\r" && nextChar === "\n")) && !inQuotes) {
      if (char === "\r") i++ // Skip the \n in \r\n

      currentRow.push(currentField.trim())
      if (currentRow.some((cell) => cell !== "")) {
        // Only add non-empty rows
        rows.push(currentRow)
      }
      currentRow = []
      currentField = ""
    }
    // Add character to current field
    else {
      currentField += char
    }
  }

  // Add the last field and row if there's any data
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some((cell) => cell !== "")) {
      rows.push(currentRow)
    }
  }

  return rows
}

// Convert 2D array back to CSV string
export function generateCSV(data: string[][]): string {
  return data
    .map((row) =>
      row
        .map((cell) => {
          // Quote fields that contain commas, quotes, or newlines
          if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
            return `"${cell.replace(/"/g, '""')}"`
          }
          return cell
        })
        .join(","),
    )
    .join("\n")
}

// Detect column types based on data
export function detectColumnTypes(data: string[][]): string[] {
  if (data.length < 2) return []

  const headers = data[0]
  const rows = data.slice(1)
  const types: string[] = []

  for (let colIndex = 0; colIndex < headers.length; colIndex++) {
    const columnValues = rows.map((row) => row[colIndex] || "")

    // Check if column is empty
    if (columnValues.every((val) => !val.trim())) {
      types.push("empty")
      continue
    }

    // Check for dates
    if (columnValues.some((val) => isLikelyDate(val))) {
      types.push("date")
      continue
    }

    // Check for phone numbers
    if (columnValues.some((val) => isLikelyPhoneNumber(val))) {
      types.push("phone")
      continue
    }

    // Check for numeric/currency values
    if (columnValues.every((val) => !val.trim() || isLikelyNumeric(val))) {
      if (columnValues.some((val) => isLikelyCurrency(val))) {
        types.push("currency")
      } else {
        types.push("number")
      }
      continue
    }

    // Check for formulas
    if (columnValues.some((val) => isLikelyFormula(val))) {
      types.push("formula")
      continue
    }

    // Default to text
    types.push("text")
  }

  return types
}

// Helper functions for type detection
function isLikelyDate(value: string): boolean {
  if (!value.trim()) return false

  // Check common date formats
  const datePatterns = [
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/, // YYYY-MM-DD or YYYY/MM/DD
    /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/, // MM-DD-YYYY or MM/DD/YYYY
    /^\d{1,2}[-/]\d{1,2}[-/]\d{2}$/, // MM-DD-YY or MM/DD/YY
    /^\d{1,2}[-\s.]\w{3,9}[-\s.]\d{2,4}$/, // DD MMM YYYY or DD-MMM-YYYY
  ]

  return datePatterns.some((pattern) => pattern.test(value)) || !isNaN(Date.parse(value))
}

function isLikelyPhoneNumber(value: string): boolean {
  if (!value.trim()) return false

  // Remove common phone number formatting characters
  const digitsOnly = value.replace(/[\s\-$$$$+.]/g, "")

  // Check if it has a reasonable number of digits for a phone number (7-15)
  return /^\d{7,15}$/.test(digitsOnly)
}

function isLikelyNumeric(value: string): boolean {
  if (!value.trim()) return false

  // Remove currency symbols and formatting
  const normalized = value.replace(/[$€£¥₹\s,]/g, "")

  // Check if it's a valid number
  return !isNaN(Number.parseFloat(normalized)) && isFinite(Number(normalized))
}

function isLikelyCurrency(value: string): boolean {
  if (!value.trim()) return false

  // Check for currency symbols or common patterns
  return /^[$€£¥₹]/.test(value) || /^\d+\s*[$€£¥₹]/.test(value) || value.includes(".00")
}

function isLikelyFormula(value: string): boolean {
  if (!value.trim()) return false

  // Check for formula patterns like =SUM(), =A1+B1, etc.
  return value.startsWith("=") || /^[A-Z]+\d+[+\-*/][A-Z]+\d+/.test(value) || /^(SUM|AVG|COUNT|MAX|MIN)\(/.test(value)
}

