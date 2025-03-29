interface ProcessOptions {
  removeEmptyRows: boolean
  standardizeDates: boolean
  removeDuplicates: boolean
  formatCurrencies: boolean
  formatPhoneNumbers: boolean
}

export function processCSV(data: string[][], options: ProcessOptions): string[][] {
  if (!data.length) return []

  // Keep the header row
  const headers = data[0]
  let rows = data.slice(1)

  // Process the data based on selected options
  if (options.removeEmptyRows) {
    rows = removeEmptyRows(rows)
  }

  if (options.standardizeDates) {
    rows = standardizeDates(headers, rows)
  }

  if (options.removeDuplicates) {
    rows = removeDuplicates(rows)
  }

  if (options.formatCurrencies) {
    rows = formatCurrencies(headers, rows)
  }

  if (options.formatPhoneNumbers) {
    rows = formatPhoneNumbers(headers, rows)
  }

  // Return the processed data with headers
  return [headers, ...rows]
}

// Remove rows that are completely empty or only contain whitespace
function removeEmptyRows(rows: string[][]): string[][] {
  return rows.filter((row) => {
    return row.some((cell) => cell.trim() !== "")
  })
}

// Standardize date formats to YYYY-MM-DD
function standardizeDates(headers: string[], rows: string[][]): string[][] {
  // Find columns that might contain dates
  const dateColumnIndexes = headers
    .map((header, index) => {
      return header.toLowerCase().includes("date") ? index : -1
    })
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

function standardizeDateFormat(dateStr: string): string {
  // Try to parse the date string
  const date = new Date(dateStr)

  // Check if the date is valid
  if (!isNaN(date.getTime())) {
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
function formatCurrencies(headers: string[], rows: string[][]): string[][] {
  // Find columns that might contain currency values
  const currencyColumnIndexes = headers
    .map((header, index) => {
      return header.toLowerCase().includes("price") ||
        header.toLowerCase().includes("cost") ||
        header.toLowerCase().includes("amount") ||
        header.toLowerCase().includes("payment")
        ? index
        : -1
    })
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
  // Remove any non-numeric characters except decimal point
  const numericValue = value.replace(/[^\d.-]/g, "")

  // Try to parse as a number
  const num = Number.parseFloat(numericValue)

  // Check if it's a valid number
  if (!isNaN(num)) {
    // Format with 2 decimal places and add dollar sign
    return `$${num.toFixed(2)}`
  }

  // If we can't parse it, return the original string
  return value
}

// Format phone numbers to (XXX) XXX-XXXX
function formatPhoneNumbers(headers: string[], rows: string[][]): string[][] {
  // Find columns that might contain phone numbers
  const phoneColumnIndexes = headers
    .map((header, index) => {
      return header.toLowerCase().includes("phone") ||
        header.toLowerCase().includes("mobile") ||
        header.toLowerCase().includes("cell")
        ? index
        : -1
    })
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

  // Check if we have a 10-digit US phone number
  if (digits.length === 10) {
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`
  }

  // If it doesn't match the expected format, return the original
  return phoneStr
}

