/**
 * Visualization utilities for CSV data
 */

// Generate data for a bar chart from a column
export function generateBarChartData(data: string[][], columnIndex: number, limit = 10) {
  if (!data || data.length < 2) return null

  const header = data[0][columnIndex]
  const values = data.slice(1).map((row) => row[columnIndex])

  // Count occurrences of each value
  const valueCounts = values.reduce(
    (acc, value) => {
      if (!value || value.trim() === "") return acc

      const key = value.trim()
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Convert to array and sort by count
  const sortedData = Object.entries(valueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }))

  // Ensure we have data to display
  if (sortedData.length === 0) {
    // Generate placeholder data if no real data exists
    return {
      title: `No data for ${header}`,
      data: [{ label: "No Data", count: 0 }],
    }
  }

  return {
    title: `Distribution of ${header}`,
    data: sortedData,
  }
}

// Enhance histogram data generation
export function generateHistogramData(data: string[][], columnIndex: number, bins = 10) {
  if (!data || data.length < 2) return null

  const header = data[0][columnIndex]

  // Extract numeric values
  const numericValues = data
    .slice(1)
    .map((row) => {
      const cell = row[columnIndex]
      if (!cell || cell.trim() === "") return null

      const numericValue = Number.parseFloat(cell.replace(/[^\d.-]/g, ""))
      return isNaN(numericValue) ? null : numericValue
    })
    .filter((val): val is number => val !== null)

  if (numericValues.length === 0) return null

  // Calculate min and max
  const min = Math.min(...numericValues)
  const max = Math.max(...numericValues)

  // Create bins
  const binWidth = (max - min) / bins
  const histogramData = Array(bins)
    .fill(0)
    .map((_, i) => {
      const binStart = min + i * binWidth
      const binEnd = binStart + binWidth
      return {
        binStart,
        binEnd,
        label: `${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`,
        count: 0,
      }
    })

  // Count values in each bin
  numericValues.forEach((value) => {
    const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1)
    histogramData[binIndex].count++
  })

  return {
    title: `Histogram of ${header}`,
    data: histogramData,
  }
}

// Enhance scatter plot data generation
export function generateScatterPlotData(data: string[][], xColumnIndex: number, yColumnIndex: number) {
  if (!data || data.length < 2) return null

  const xHeader = data[0][xColumnIndex]
  const yHeader = data[0][yColumnIndex]

  // Extract paired numeric values
  const points = data
    .slice(1)
    .map((row) => {
      const xCell = row[xColumnIndex]
      const yCell = row[yColumnIndex]

      if (!xCell || !yCell || xCell.trim() === "" || yCell.trim() === "") return null

      const x = Number.parseFloat(xCell.replace(/[^\d.-]/g, ""))
      const y = Number.parseFloat(yCell.replace(/[^\d.-]/g, ""))

      return !isNaN(x) && !isNaN(y) ? { x, y } : null
    })
    .filter((point): point is { x: number; y: number } => point !== null)

  if (points.length === 0) return null

  return {
    title: `${xHeader} vs ${yHeader}`,
    xLabel: xHeader,
    yLabel: yHeader,
    data: points,
  }
}

// Generate a heatmap of correlations between numeric columns
export function generateCorrelationHeatmap(data: string[][]) {
  if (!data || data.length < 2) return null

  const headers = data[0]

  // Find numeric columns
  const numericColumnIndices = headers
    .map((_, index) => {
      // Check if column has numeric values
      const hasNumericValues = data.slice(1).some((row) => {
        const cell = row[index]
        if (!cell || cell.trim() === "") return false

        const numericValue = Number.parseFloat(cell.replace(/[^\d.-]/g, ""))
        return !isNaN(numericValue)
      })

      return hasNumericValues ? index : -1
    })
    .filter((index) => index !== -1)

  if (numericColumnIndices.length < 2) return null

  // Calculate correlation matrix
  const correlationMatrix: { x: string; y: string; correlation: number | null }[] = []

  for (let i = 0; i < numericColumnIndices.length; i++) {
    for (let j = 0; j < numericColumnIndices.length; j++) {
      const colIndex1 = numericColumnIndices[i]
      const colIndex2 = numericColumnIndices[j]

      const correlation =
        i === j
          ? 1 // Perfect correlation with itself
          : calculateCorrelation(data, colIndex1, colIndex2)

      correlationMatrix.push({
        x: headers[colIndex1],
        y: headers[colIndex2],
        correlation,
      })
    }
  }

  return {
    title: "Correlation Heatmap",
    data: correlationMatrix,
  }
}

// Helper function to calculate correlation
function calculateCorrelation(data: string[][], columnIndex1: number, columnIndex2: number) {
  // Extract paired numeric values
  const pairs = data
    .slice(1)
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

  // Calculate correlation coefficient
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

  return numerator / Math.sqrt(denominator1 * denominator2)
}

