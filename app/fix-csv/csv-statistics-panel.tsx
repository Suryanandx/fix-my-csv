"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateBarChartData, generateHistogramData } from "@/lib/utils/csv-visualization"
import { calculateColumnStatistics } from "@/lib/utils/csv-statistics"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, BarChart3, LineChartIcon, PieChartIcon, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CsvStatisticsPanelProps {
  data: string[][]
}

// Custom colors for charts
const CHART_COLORS = ["#34B76F", "#4285F4", "#FBBC05", "#EA4335", "#7E57C2", "#26A69A", "#FB8C00"]

export function CsvStatisticsPanel({ data }: CsvStatisticsPanelProps) {
  const [selectedColumn, setSelectedColumn] = useState<number>(0)
  const [chartData, setChartData] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [distributionData, setDistributionData] = useState<any[]>([])
  const [valueTypeCounts, setValueTypeCounts] = useState<any[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (data.length > 1) {
      setIsLoading(true)

      // Use setTimeout to allow the loading state to render
      setTimeout(() => {
        try {
          if (selectedColumn >= 0) {
            // Generate chart data
            const barData = generateBarChartData(data, selectedColumn, 10)
            const histData = generateHistogramData(data, selectedColumn, 8)

            setChartData({
              bar: barData,
              histogram: histData,
            })

            // Calculate statistics
            const columnStats = calculateColumnStatistics(data, selectedColumn)
            setStats(columnStats)

            // Generate distribution data for line chart
            if (histData && histData.data) {
              setDistributionData(
                histData.data.map((item: any) => ({
                  range: item.label,
                  count: item.count,
                })),
              )
            }

            // Generate data type distribution for the column
            analyzeColumnValues(selectedColumn)
          }
        } catch (error) {
          console.error("Error generating statistics:", error)
        } finally {
          setIsLoading(false)
        }
      }, 500)
    } else {
      setIsLoading(false)
    }
  }, [data, selectedColumn])

  // Function to analyze column values and count types
  const analyzeColumnValues = (columnIndex: number) => {
    if (!data || data.length < 2) {
      setValueTypeCounts([])
      return
    }

    const values = data
      .slice(1)
      .map((row) => row[columnIndex])
      .filter((val) => val && val.trim() !== "")

    // Initialize counters
    let numericCount = 0
    let dateCount = 0
    let textCount = 0
    let emptyCount = 0

    // Analyze each value
    values.forEach((value) => {
      if (!value || value.trim() === "") {
        emptyCount++
      } else if (!isNaN(Number(value.replace(/[^\d.-]/g, "")))) {
        numericCount++
      } else if (isLikelyDate(value)) {
        dateCount++
      } else {
        textCount++
      }
    })

    // Create pie chart data
    setValueTypeCounts(
      [
        { name: "Numeric", value: numericCount },
        { name: "Date", value: dateCount },
        { name: "Text", value: textCount },
        { name: "Empty", value: emptyCount },
      ].filter((item) => item.value > 0),
    )
  }

  // Helper to check if a value is likely a date
  const isLikelyDate = (value: string): boolean => {
    const datePatterns = [
      /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/,
      /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/,
      /^\d{1,2}[-/]\d{1,2}[-/]\d{2}$/,
    ]

    return datePatterns.some((pattern) => pattern.test(value)) || !isNaN(Date.parse(value))
  }

  // Custom active shape for PieChart
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} className="text-sm font-medium">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={10} textAnchor="middle" fill="#999" className="text-sm">
          {`${value} values (${(percent * 100).toFixed(1)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    )
  }

  // Format the statistic value for display
  const formatStatValue = (stat: any, key: string) => {
    if (stat === null || stat[key] === null) return "N/A"

    // Format based on statistic type
    switch (key) {
      case "min":
      case "max":
      case "mean":
      case "median":
      case "sum":
        return typeof stat[key] === "number"
          ? stat[key].toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
          : stat[key]
      case "stdDev":
        return typeof stat[key] === "number"
          ? stat[key].toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 3,
            })
          : stat[key]
      case "count":
        return stat[key].toLocaleString()
      default:
        return stat[key]
    }
  }

  if (!data || data.length < 2) {
    return (
      <Card className="csv-theme-card">
        <CardHeader className="csv-theme-header">
          <CardTitle className="csv-theme-title">
            <BarChart3 className="csv-theme-icon" />
            Data Analysis
          </CardTitle>
          <CardDescription>Analyze and visualize your CSV data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No data available</AlertTitle>
            <AlertDescription>Upload and process a CSV file to see statistical analysis.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const headers = data[0]

  // Ensure the chart is properly rendered with correct dimensions
  return (
    <Card className="csv-theme-card">
      <CardHeader className="csv-theme-header">
        <CardTitle className="csv-theme-title">
          <BarChart3 className="csv-theme-icon" />
          Data Analysis
        </CardTitle>
        <CardDescription>Analyze and visualize your CSV data</CardDescription>

        <div className="mt-2">
          <Select
            value={selectedColumn.toString()}
            onValueChange={(value) => setSelectedColumn(Number.parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a column" />
            </SelectTrigger>
            <SelectContent>
              {headers.map((header, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chart" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span>Chart</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span>Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center">
              <LineChartIcon className="h-4 w-4 mr-2" />
              <span>Distribution</span>
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center">
              <PieChartIcon className="h-4 w-4 mr-2" />
              <span>Types</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            {isLoading ? (
              <div className="h-[300px] mt-4 flex items-center justify-center">
                <Skeleton className="h-[250px] w-full rounded-md" />
              </div>
            ) : chartData?.bar ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mt-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <span className="w-3 h-3 rounded-full bg-csv-chart-blue mr-2"></span>
                    <span>{chartData.bar.title}</span>
                  </h3>
                  <Badge variant="outline" className="csv-theme-badge">
                    Top 10 Values
                  </Badge>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.bar.data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <RechartsTooltip
                        cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#4285F4"
                        animationBegin={0}
                        animationDuration={1000}
                        radius={[4, 4, 0, 0]}
                      >
                        {chartData.bar.data.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No chart data available</AlertTitle>
                  <AlertDescription>
                    This column doesn't contain data suitable for charting. Try selecting a different column.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats">
            {isLoading ? (
              <div className="space-y-4 mt-4">
                <Skeleton className="h-[250px] w-full rounded-md" />
              </div>
            ) : stats && !stats.isEmpty ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatsCard
                    title="Count"
                    value={formatStatValue(stats, "count")}
                    description="Total non-empty values"
                    color="blue"
                  />
                  <StatsCard
                    title="Sum"
                    value={formatStatValue(stats, "sum")}
                    description="Sum of all values"
                    color="green"
                  />
                  <StatsCard
                    title="Mean"
                    value={formatStatValue(stats, "mean")}
                    description="Average value"
                    color="yellow"
                  />
                  <StatsCard
                    title="Median"
                    value={formatStatValue(stats, "median")}
                    description="Middle value"
                    color="red"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <StatsCard
                    title="Min"
                    value={formatStatValue(stats, "min")}
                    description="Smallest value"
                    color="purple"
                  />
                  <StatsCard
                    title="Max"
                    value={formatStatValue(stats, "max")}
                    description="Largest value"
                    color="teal"
                  />
                  <StatsCard
                    title="Std. Deviation"
                    value={formatStatValue(stats, "stdDev")}
                    description="Measure of variation"
                    color="orange"
                  />
                  <StatsCard
                    title="Range"
                    value={
                      stats.max !== null && stats.min !== null
                        ? (stats.max - stats.min).toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })
                        : "N/A"
                    }
                    description="Difference between max and min"
                    color="blue"
                  />
                </div>

                <div className="mt-6 bg-csv-green-50 p-4 rounded-md">
                  <h3 className="font-medium text-csv-green-800 mb-2">Analysis Insights</h3>
                  <p className="text-sm text-csv-green-700">{generateInsightsText(stats, headers[selectedColumn])}</p>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No statistical data available</AlertTitle>
                  <AlertDescription>
                    This column doesn't contain numeric data for statistical analysis. Try selecting a different column.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>

          <TabsContent value="distribution">
            {isLoading ? (
              <div className="h-[300px] mt-4 flex items-center justify-center">
                <Skeleton className="h-[250px] w-full rounded-md" />
              </div>
            ) : distributionData.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mt-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-csv-chart-blue to-csv-chart-purple mr-2"></span>
                    <span>Value Distribution</span>
                  </h3>
                  <Badge variant="outline" className="csv-theme-badge">
                    Frequency Chart
                  </Badge>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={distributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="range"
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <RechartsTooltip
                        formatter={(value) => [`Count: ${value}`, "Frequency"]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Frequency"
                        stroke="#34B76F"
                        strokeWidth={2}
                        activeDot={{ r: 8, fill: "#34B76F", stroke: "white" }}
                        dot={{ r: 4, fill: "#34B76F", stroke: "white", strokeWidth: 1 }}
                        animationBegin={0}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-blue-50 p-3 rounded-md mt-2">
                  <p className="text-sm text-blue-700">
                    This chart shows how values are distributed across ranges. Peaks indicate where most values are
                    concentrated.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No distribution data available</AlertTitle>
                  <AlertDescription>
                    This column doesn't contain enough data to show a distribution. Try selecting a different column.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>

          <TabsContent value="types">
            {isLoading ? (
              <div className="h-[300px] mt-4 flex items-center justify-center">
                <Skeleton className="h-[250px] w-full rounded-md" />
              </div>
            ) : valueTypeCounts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mt-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <span className="w-3 h-3 rounded-full bg-csv-chart-green mr-2"></span>
                    <span>Value Types in "{headers[selectedColumn]}"</span>
                  </h3>
                  <Badge variant="outline" className="csv-theme-badge">
                    Data Type Analysis
                  </Badge>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={valueTypeCounts}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                      >
                        {valueTypeCounts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-slate-50 p-3 rounded-md mt-2">
                  <p className="text-sm text-slate-700">
                    This analysis shows the distribution of data types in this column. Hover over segments to see
                    details. Consistent data types indicate clean data.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No type analysis available</AlertTitle>
                  <AlertDescription>
                    Unable to analyze data types for this column. Try selecting a different column.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Helper function to generate insights text based on statistics
function generateInsightsText(stats: any, columnName: string): string {
  if (!stats || stats.isEmpty) return "No statistical insights available for this column."

  const insightParts = []

  // Distribution insight
  if (stats.mean !== null && stats.median !== null) {
    const meanMedianDiff = Math.abs(stats.mean - stats.median)
    const percentDiff = (meanMedianDiff / stats.mean) * 100

    if (percentDiff > 10) {
      insightParts.push(
        `The column "${columnName}" shows a skewed distribution (${percentDiff.toFixed(1)}% difference between mean and median).`,
      )
    } else {
      insightParts.push(`Values in "${columnName}" follow a relatively normal distribution.`)
    }
  }

  // Variation insight
  if (stats.stdDev !== null && stats.mean !== null) {
    const cv = (stats.stdDev / Math.abs(stats.mean)) * 100
    if (cv > 30) {
      insightParts.push(`High variability detected with a coefficient of variation of ${cv.toFixed(1)}%.`)
    } else if (cv < 10) {
      insightParts.push(`Data shows low variability with a coefficient of variation of ${cv.toFixed(1)}%.`)
    }
  }

  // Range insight
  if (stats.min !== null && stats.max !== null) {
    const range = stats.max - stats.min
    insightParts.push(
      `Values range from ${stats.min.toLocaleString()} to ${stats.max.toLocaleString()}, spanning ${range.toLocaleString()}.`,
    )
  }

  return insightParts.join(" ")
}

// Stats card component
function StatsCard({
  title,
  value,
  description,
  color,
}: { title: string; value: string; description: string; color: string }) {
  const getColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-csv-chart-blue"
      case "green":
        return "bg-csv-green-500"
      case "yellow":
        return "bg-csv-chart-yellow"
      case "red":
        return "bg-csv-chart-red"
      case "purple":
        return "bg-csv-chart-purple"
      case "teal":
        return "bg-csv-chart-teal"
      case "orange":
        return "bg-csv-chart-orange"
      default:
        return "bg-csv-chart-blue"
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center mb-2">
        <div className={`w-3 h-3 rounded-full ${getColorClass(color)} mr-2`}></div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}

