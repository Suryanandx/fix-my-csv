"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, Zap, AlertTriangle, Info } from "lucide-react"
import { calculateColumnStatistics, calculateCorrelation } from "@/lib/utils/csv-statistics"
import { generateScatterPlotData } from "@/lib/utils/csv-visualization"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface InsightsPanelProps {
  data: string[][]
  columnTypes: string[]
}

export function InsightsPanel({ data, columnTypes }: InsightsPanelProps) {
  const [insights, setInsights] = useState<any[]>([])
  const [correlations, setCorrelations] = useState<any[]>([])
  const [selectedColumns, setSelectedColumns] = useState<{ x: number; y: number }>({ x: 0, y: 1 })
  const [trendData, setTrendData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("insights")

  useEffect(() => {
    if (data.length < 2) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Use setTimeout to allow the loading state to render
    setTimeout(() => {
      try {
        const headers = data[0]
        const generatedInsights: any[] = []

        // Find numeric columns
        const numericColumns = columnTypes
          .map((type, index) => (type === "number" || type === "currency" ? index : -1))
          .filter((index) => index !== -1)

        // Find date columns
        const dateColumns = columnTypes
          .map((type, index) => (type === "date" ? index : -1))
          .filter((index) => index !== -1)

        // 1. Generate statistics for each numeric column
        numericColumns.forEach((colIndex) => {
          const stats = calculateColumnStatistics(data, colIndex)

          if (!stats.isEmpty) {
            // Detect outliers
            const outlierThreshold = stats.stdDev * 2
            const hasOutliers = data.slice(1).some((row) => {
              const value = Number.parseFloat(row[colIndex].replace(/[^\d.-]/g, ""))
              return !isNaN(value) && Math.abs(value - stats.mean) > outlierThreshold
            })

            if (hasOutliers) {
              generatedInsights.push({
                type: "outlier",
                title: `Outliers detected in "${headers[colIndex]}"`,
                description: `This column contains values that deviate significantly from the average (${stats.mean.toFixed(2)}).`,
                importance: "high",
                columnIndex: colIndex,
              })
            }

            // Check for skewed distribution
            const skewThreshold = 0.5
            const skewness = calculateSkewness(
              data.slice(1).map((row) => {
                const value = Number.parseFloat(row[colIndex].replace(/[^\d.-]/g, ""))
                return isNaN(value) ? 0 : value
              }),
            )

            if (Math.abs(skewness) > skewThreshold) {
              generatedInsights.push({
                type: "skew",
                title: `Skewed distribution in "${headers[colIndex]}"`,
                description: `The data is ${skewness > 0 ? "positively" : "negatively"} skewed, with most values ${skewness > 0 ? "below" : "above"} the average.`,
                importance: "medium",
                columnIndex: colIndex,
              })
            }
          }
        })

        // 2. Find correlations between numeric columns
        const correlationResults: any[] = []

        for (let i = 0; i < numericColumns.length; i++) {
          for (let j = i + 1; j < numericColumns.length; j++) {
            const col1 = numericColumns[i]
            const col2 = numericColumns[j]

            const correlation = calculateCorrelation(data, col1, col2)

            if (correlation !== null && Math.abs(correlation) > 0.7) {
              correlationResults.push({
                columns: [col1, col2],
                columnNames: [headers[col1], headers[col2]],
                correlation: correlation,
                strength: Math.abs(correlation) > 0.9 ? "very strong" : "strong",
                direction: correlation > 0 ? "positive" : "negative",
              })

              generatedInsights.push({
                type: "correlation",
                title: `Strong correlation between "${headers[col1]}" and "${headers[col2]}"`,
                description: `There's a ${Math.abs(correlation) > 0.9 ? "very strong" : "strong"} ${correlation > 0 ? "positive" : "negative"} correlation (${correlation.toFixed(2)})`,
                importance: Math.abs(correlation) > 0.9 ? "high" : "medium",
                columnIndices: [col1, col2],
              })
            }
          }
        }

        // 3. Detect trends in time series data
        if (dateColumns.length > 0 && numericColumns.length > 0) {
          const dateColumn = dateColumns[0]
          const numericColumn = numericColumns[0]

          // Extract dates and values
          const timeSeriesData = data
            .slice(1)
            .map((row) => {
              const dateStr = row[dateColumn]
              const valueStr = row[numericColumn]

              try {
                const date = new Date(dateStr)
                const value = Number.parseFloat(valueStr.replace(/[^\d.-]/g, ""))

                if (!isNaN(date.getTime()) && !isNaN(value)) {
                  return { date, value }
                }
                return null
              } catch (e) {
                return null
              }
            })
            .filter((item): item is { date: Date; value: number } => item !== null)
            .sort((a, b) => a.date.getTime() - b.date.getTime())

          if (timeSeriesData.length > 3) {
            // Prepare data for chart
            const chartData = timeSeriesData.map((item) => ({
              date: item.date.toISOString().split("T")[0],
              value: item.value,
            }))

            setTrendData(chartData)

            // Detect trend
            const firstValue = timeSeriesData[0].value
            const lastValue = timeSeriesData[timeSeriesData.length - 1].value
            const percentChange = ((lastValue - firstValue) / Math.abs(firstValue)) * 100

            if (Math.abs(percentChange) > 20) {
              generatedInsights.push({
                type: "trend",
                title: `${percentChange > 0 ? "Increasing" : "Decreasing"} trend in "${headers[numericColumn]}" over time`,
                description: `There's a ${Math.abs(percentChange).toFixed(0)}% ${percentChange > 0 ? "increase" : "decrease"} from first to last value`,
                importance: Math.abs(percentChange) > 50 ? "high" : "medium",
                columnIndices: [dateColumn, numericColumn],
              })
            }
          }
        }

        // Sort insights by importance
        generatedInsights.sort((a, b) => {
          const importanceOrder = { high: 0, medium: 1, low: 2 }
          return importanceOrder[a.importance] - importanceOrder[b.importance]
        })

        setInsights(generatedInsights)
        setCorrelations(correlationResults)

        // Set default selected columns for scatter plot
        if (numericColumns.length >= 2) {
          setSelectedColumns({ x: numericColumns[0], y: numericColumns[1] })
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error generating insights:", error)
        setIsLoading(false)
      }
    }, 500)
  }, [data, columnTypes])

  if (!data.length || data.length < 2) {
    return (
      <Card className="csv-theme-card">
        <CardHeader className="csv-theme-header">
          <CardTitle className="csv-theme-title">
            <Sparkles className="csv-theme-icon" />
            <span>CSV Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No data available</AlertTitle>
            <AlertDescription>Upload and process a CSV file to see insights and analysis.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const headers = data[0]

  // Get numeric column options for the scatter plot
  const numericColumnOptions = columnTypes
    .map((type, index) => ({
      index,
      name: headers[index],
      isNumeric: type === "number" || type === "currency",
    }))
    .filter((col) => col.isNumeric)

  // Generate scatter plot data
  const scatterData = generateScatterPlotData(data, selectedColumns.x, selectedColumns.y)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Ensure the scatter plot is properly rendered
  return (
    <Card className="csv-theme-card">
      <CardHeader className="csv-theme-header">
        <CardTitle className="csv-theme-title">
          <Sparkles className="csv-theme-icon" />
          <span>CSV Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="insights">Key Insights</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-md border">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : insights.length > 0 ? (
              <div className="space-y-4 mt-4">
                {insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className={`p-4 rounded-md border ${getInsightBgColor(insight.type, insight.importance)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${getInsightIconBgColor(insight.type)}`}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{insight.title}</h3>
                          <Badge variant="outline" className={getImportanceBadgeClass(insight.importance)}>
                            {insight.importance}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>

                        {insight.type === "outlier" && (
                          <div className="mt-3">
                            <Button size="sm" variant="outline">
                              Analyze Outliers
                            </Button>
                          </div>
                        )}

                        {insight.type === "correlation" && (
                          <div className="mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedColumns({
                                  x: insight.columnIndices[0],
                                  y: insight.columnIndices[1],
                                })
                                setActiveTab("correlations")
                              }}
                            >
                              View Scatter Plot
                            </Button>
                          </div>
                        )}

                        {insight.type === "trend" && (
                          <div className="mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setActiveTab("trends")
                              }}
                            >
                              View Trend Chart
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No significant insights detected</AlertTitle>
                  <AlertDescription>
                    We couldn't find any notable patterns or issues in your data. This could mean your data is already
                    clean and well-structured.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>

          {/* Correlations tab content */}
          <TabsContent value="correlations">
            <div className="mt-4 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Correlation Analysis</h3>

                  <div className="flex space-x-2">
                    <Select
                      value={selectedColumns.x.toString()}
                      onValueChange={(val) => setSelectedColumns((prev) => ({ ...prev, x: Number.parseInt(val) }))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="X-axis column" />
                      </SelectTrigger>
                      <SelectContent>
                        {numericColumnOptions.map((col) => (
                          <SelectItem key={col.index} value={col.index.toString()}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedColumns.y.toString()}
                      onValueChange={(val) => setSelectedColumns((prev) => ({ ...prev, y: Number.parseInt(val) }))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Y-axis column" />
                      </SelectTrigger>
                      <SelectContent>
                        {numericColumnOptions.map((col) => (
                          <SelectItem key={col.index} value={col.index.toString()}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full rounded-md" />
                  </div>
                ) : numericColumnOptions.length < 2 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Not enough numeric columns</AlertTitle>
                    <AlertDescription>
                      Correlation analysis requires at least two numeric columns. Your data doesn't have enough numeric
                      columns to perform this analysis.
                    </AlertDescription>
                  </Alert>
                ) : scatterData ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          dataKey="x"
                          name={headers[selectedColumns.x]}
                          label={{ value: headers[selectedColumns.x], position: "bottom", offset: 10 }}
                        />
                        <YAxis
                          type="number"
                          dataKey="y"
                          name={headers[selectedColumns.y]}
                          label={{ value: headers[selectedColumns.y], angle: -90, position: "left" }}
                        />
                        <ZAxis range={[60, 60]} />
                        <RechartsTooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          formatter={(value, name, props) => {
                            if (name === "x") return [value, headers[selectedColumns.x]]
                            if (name === "y") return [value, headers[selectedColumns.y]]
                            return [value, name]
                          }}
                        />
                        <Legend />
                        <Scatter name="Data Points" data={scatterData?.data || []} fill="#34B76F" shape="circle" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>No correlation data available</AlertTitle>
                      <AlertDescription>Select two numeric columns to visualize their correlation.</AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Trends tab content */}
          <TabsContent value="trends">
            <div className="mt-4 space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-[300px] w-full" />
                  <Skeleton className="h-[100px] w-full" />
                </div>
              ) : trendData.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-medium">Time Series Analysis</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" label={{ value: "Date", position: "bottom", offset: 0 }} />
                        <YAxis label={{ value: "Value", angle: -90, position: "insideLeft" }} />
                        <RechartsTooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          name="Value Over Time"
                          stroke="#34B76F"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No time series data detected</AlertTitle>
                    <AlertDescription>
                      To see trends, your data should contain at least one date column and one numeric column. Try
                      processing your CSV with date standardization enabled.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Helper function to calculate skewness
function calculateSkewness(values: number[]): number {
  if (values.length === 0) return 0

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  if (stdDev === 0) return 0

  const cubedDeviations = values.map((val) => Math.pow((val - mean) / stdDev, 3))
  return cubedDeviations.reduce((sum, val) => sum + val, 0) / values.length
}

// Helper functions for styling based on insight type and importance
function getInsightBgColor(type: string, importance: string): string {
  switch (type) {
    case "outlier":
      return importance === "high"
        ? "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
        : "border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800"
    case "correlation":
      return importance === "high"
        ? "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800"
        : "border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800"
    case "trend":
      return importance === "high"
        ? "border-csv-green-200 bg-csv-green-50 dark:bg-csv-green-900/20 dark:border-csv-green-800"
        : "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800"
    case "skew":
      return "border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800"
    default:
      return "border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800"
  }
}

function getInsightIconBgColor(type: string): string {
  switch (type) {
    case "outlier":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"
    case "correlation":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
    case "trend":
      return "bg-csv-green-100 text-csv-green-700 dark:bg-csv-green-900 dark:text-csv-green-100"
    case "skew":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-100"
  }
}

function getInsightIcon(type: string) {
  switch (type) {
    case "outlier":
      return <AlertTriangle className="h-4 w-4" />
    case "correlation":
      return <Zap className="h-4 w-4" />
    case "trend":
      return <TrendingUp className="h-4 w-4" />
    case "skew":
      return <Sparkles className="h-4 w-4" />
    default:
      return <Sparkles className="h-4 w-4" />
  }
}

function getImportanceBadgeClass(importance: string): string {
  switch (importance) {
    case "high":
      return "bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-100"
    case "medium":
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/50 dark:text-amber-100"
    case "low":
      return "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-100"
    default:
      return "bg-gray-50 text-gray-700 dark:bg-gray-900/50 dark:text-gray-100"
  }
}

function calculateTrendSummary(data: any[]): string {
  if (!data.length) return "No trend data available"

  const firstValue = data[0].value
  const lastValue = data[data.length - 1].value
  const percentChange = ((lastValue - firstValue) / Math.abs(firstValue)) * 100

  // Calculate average rate of change
  let sumChanges = 0
  let countChanges = 0

  for (let i = 1; i < data.length; i++) {
    const prevValue = data[i - 1].value
    const currValue = data[i].value
    if (prevValue !== 0) {
      sumChanges += (currValue - prevValue) / Math.abs(prevValue)
      countChanges++
    }
  }

  const avgChangeRate = countChanges > 0 ? (sumChanges / countChanges) * 100 : 0

  let trendDescription = ""

  if (Math.abs(percentChange) < 5) {
    trendDescription = "Values remain stable over the time period"
  } else if (percentChange > 0) {
    trendDescription = `Values have increased by ${percentChange.toFixed(1)}% over the time period`

    if (avgChangeRate > 0) {
      trendDescription += `, with an average increase of ${avgChangeRate.toFixed(1)}% between consecutive data points.`
    }
  } else {
    trendDescription = `Values have decreased by ${Math.abs(percentChange).toFixed(1)}% over the time period`

    if (avgChangeRate < 0) {
      trendDescription += `, with an average decrease of ${Math.abs(avgChangeRate).toFixed(1)}% between consecutive data points.`
    }
  }

  return trendDescription
}

function calculateVolatility(data: any[]): string {
  if (data.length < 3) return "Not enough data points to calculate volatility."

  const values = data.map((item) => item.value)
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  const stdDev = Math.sqrt(variance)

  // Coefficient of variation as a measure of volatility
  const volatility = (stdDev / mean) * 100

  if (volatility < 10) {
    return `Low volatility (${volatility.toFixed(1)}%). The data shows stable, predictable behavior with minimal fluctuations.`
  } else if (volatility < 25) {
    return `Moderate volatility (${volatility.toFixed(1)}%). The data shows some fluctuations but maintains a relatively consistent pattern.`
  } else {
    return `High volatility (${volatility.toFixed(1)}%). The data shows significant fluctuations, indicating unstable or unpredictable behavior.`
  }
}

function checkSeasonality(data: any[]): string {
  if (data.length < 12) return "Not enough data points to detect seasonality patterns."

  try {
    // Extract months from dates to check for monthly patterns
    const monthlyData: Record<string, number[]> = {}

    data.forEach((item) => {
      const date = new Date(item.date)
      const month = date.toLocaleString("default", { month: "short" })

      if (!monthlyData[month]) {
        monthlyData[month] = []
      }

      monthlyData[month].push(item.value)
    })

    // Check if we have enough months with multiple data points
    const monthsWithMultiplePoints = Object.values(monthlyData).filter((values) => values.length > 1).length

    if (monthsWithMultiplePoints < 3) {
      return "Not enough recurring time periods to detect seasonality."
    }

    // Calculate average values for each month
    const monthlyAverages = Object.entries(monthlyData).map(([month, values]) => {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length
      return { month, avg }
    })

    // Calculate overall average
    const allValues = Object.values(monthlyData).flat()
    const overallAvg = allValues.reduce((sum, val) => sum + val, 0) / allValues.length

    // Calculate variance between monthly averages
    const monthlyVariance =
      monthlyAverages.reduce((sum, { avg }) => sum + Math.pow(avg - overallAvg, 2), 0) / monthlyAverages.length
    const overallVariance = allValues.reduce((sum, val) => sum + Math.pow(val - overallAvg, 2), 0) / allValues.length

    // If monthly variance is significantly higher than overall variance, it suggests seasonality
    const seasonalityRatio = monthlyVariance / overallVariance

    if (seasonalityRatio > 1.5) {
      return "Strong seasonal patterns detected. The data shows regular fluctuations that repeat at specific time intervals."
    } else if (seasonalityRatio > 1.1) {
      return "Moderate seasonal patterns detected. There are some recurring patterns, but they're not very pronounced."
    } else {
      return "No significant seasonal patterns detected. The data doesn't show regular recurring patterns."
    }
  } catch (error) {
    return "Unable to analyze seasonality due to data format issues."
  }
}

function calculateMonthlyAverages(data: any[]): any[] {
  if (data.length < 2) return []

  try {
    const monthlyData: Record<string, number[]> = {}

    // Group values by month
    data.forEach((item) => {
      const date = new Date(item.date)
      const month = date.toLocaleString("default", { month: "short" })

      if (!monthlyData[month]) {
        monthlyData[month] = []
      }

      monthlyData[month].push(item.value)
    })

    // Calculate average for each month
    const result = Object.entries(monthlyData).map(([month, values]) => {
      const average = values.reduce((sum, val) => sum + val, 0) / values.length
      return { month, average }
    })

    // Sort by month order
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return result.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month))
  } catch (error) {
    return []
  }
}

