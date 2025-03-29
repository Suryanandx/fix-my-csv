/**
 * Statistical analysis utilities for CSV data
 */

// Calculate basic statistics for a numeric column
export function calculateColumnStatistics(data: string[][], columnIndex: number) {
  // Extract numeric values from the column
  const values = data
    .slice(1) // Skip header
    .map((row) => {
      const cell = row[columnIndex]
      if (!cell || cell.trim() === "") return null

      // Extract numeric value
      const numericValue = cell.replace(/[^\d.-]/g, "")
      const num = Number.parseFloat(numericValue)
      return isNaN(num) ? null : num
    })
    .filter((val): val is number => val !== null)

  if (values.length === 0) {
    return {
      count: 0,
      min: null,
      max: null,
      sum: null,
      mean: null,
      median: null,
      stdDev: null,
      isEmpty: true,
    }
  }

  // Sort values for percentile calculations
  const sortedValues = [...values].sort((a, b) => a - b)

  // Calculate statistics
  const count = values.length
  const min = sortedValues[0]
  const max = sortedValues[sortedValues.length - 1]
  const sum = values.reduce((acc, val) => acc + val, 0)
  const mean = sum / count

  // Calculate median
  const midIndex = Math.floor(sortedValues.length / 2)
  const median =
    sortedValues.length % 2 === 0 ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2 : sortedValues[midIndex]

  // Calculate standard deviation
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / count
  const stdDev = Math.sqrt(variance)

  return {
    count,
    min,
    max,
    sum,
    mean,
    median,
    stdDev,
    isEmpty: false,
    // Add additional statistics for more comprehensive analysis
    range: max - min,
    q1: sortedValues[Math.floor(count * 0.25)],
    q3: sortedValues[Math.floor(count * 0.75)],
    iqr: sortedValues[Math.floor(count * 0.75)] - sortedValues[Math.floor(count * 0.25)],
    coefficientOfVariation: (stdDev / mean) * 100,
  }
}

// Enhance the correlation calculation function
export function calculateCorrelation(data: string[][], columnIndex1: number, columnIndex2: number) {
  // Extract paired numeric values
  const pairs = data
    .slice(1) // Skip header
    .map((row) => {
      const cell1 = row[columnIndex1]
      const cell2 = row[columnIndex2]

      if (!cell1 || !cell2 || cell1.trim() === "" || cell2.trim() === "") return null

      const num1 = Number.parseFloat(cell1.replace(/[^\d.-]/g, ""))
      const num2 = Number.parseFloat(cell2.replace(/[^\d.-]/g, ""))

      return !isNaN(num1) && !isNaN(num2) ? [num1, num2] : null
    })
    .filter((pair): pair is [number, number] => pair !== null)

  if (pairs.length < 2) {
    return null // Not enough data for correlation
  }

  // Calculate means
  const sum1 = pairs.reduce((acc, [val1]) => acc + val1, 0)
  const sum2 = pairs.reduce((acc, [, val2]) => acc + val2, 0)
  const mean1 = sum1 / pairs.length
  const mean2 = sum2 / pairs.length

  // Calculate correlation coefficient (Pearson's r)
  let numerator = 0
  let denominator1 = 0
  let denominator2 = 0

  for (const [val1, val2] of pairs) {
    const diff1 = val1 - mean1
    const diff2 = val2 - mean2

    numerator += diff1 * diff2
    denominator1 += diff1 * diff1
    denominator2 += diff2 * diff2
  }

  if (denominator1 === 0 || denominator2 === 0) {
    return null // Avoid division by zero
  }

  const correlation = numerator / Math.sqrt(denominator1 * denominator2)

  // Ensure correlation is within valid range [-1, 1]
  return Math.max(-1, Math.min(1, correlation))
}

// Generate summary statistics for all numeric columns
export function generateDataSummary(data: string[][]) {
  if (!data || data.length < 2) return null

  const headers = data[0]
  const summary: Record<string, any> = {}

  headers.forEach((header, index) => {
    const stats = calculateColumnStatistics(data, index)
    if (!stats.isEmpty) {
      summary[header] = stats
    }
  })

  return summary
}

// Detect columns that might benefit from normalization
export function detectColumnsForNormalization(data: string[][]) {
  if (!data || data.length < 2) return []

  const headers = data[0]
  const columnsToNormalize: number[] = []

  headers.forEach((header, index) => {
    const stats = calculateColumnStatistics(data, index)

    // If the column has numeric values with a wide range, it might benefit from normalization
    if (!stats.isEmpty && stats.min !== null && stats.max !== null) {
      const range = stats.max - stats.min
      if (range > 100 || (stats.stdDev && stats.stdDev > 10)) {
        columnsToNormalize.push(index)
      }
    }
  })

  return columnsToNormalize
}

// Normalize values in a column to a 0-1 range
export function normalizeColumn(data: string[][], columnIndex: number) {
  const stats = calculateColumnStatistics(data, columnIndex)

  if (stats.isEmpty || stats.min === null || stats.max === null || stats.min === stats.max) {
    return data // Can't normalize
  }

  const range = stats.max - stats.min

  return data.map((row, rowIndex) => {
    // Skip the header row
    if (rowIndex === 0) return row

    const newRow = [...row]
    const cell = row[columnIndex]

    if (cell && cell.trim() !== "") {
      const numericValue = Number.parseFloat(cell.replace(/[^\d.-]/g, ""))

      if (!isNaN(numericValue)) {
        // Normalize to 0-1 range
        const normalizedValue = (numericValue - stats.min) / range
        newRow[columnIndex] = normalizedValue.toFixed(4)
      }
    }

    return newRow
  })
}

