"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, FileText } from "lucide-react"

interface ComparisonViewProps {
  originalData: string[][]
  processedData: string[][]
}

export function ComparisonView({ originalData, processedData }: ComparisonViewProps) {
  const [selectedView, setSelectedView] = useState<string>("summary")
  const [isLoading, setIsLoading] = useState(true)

  // Calculate comparison metrics
  const metrics = useMemo(() => {
    setIsLoading(true)

    // Use setTimeout to allow the loading state to render
    setTimeout(() => {
      setIsLoading(false)
    }, 500)

    if (!originalData.length || !processedData.length) {
      return {
        totalCells: 0,
        changedCells: 0,
        changePercentage: 0,
        emptyRemoved: 0,
        formattingChanges: 0,
        valueChanges: 0,
        structuralChanges: 0,
      }
    }

    // Skip headers for these calculations
    const originalRows = originalData.slice(1)
    const processedRows = processedData.slice(1)

    let totalCells = 0
    let changedCells = 0
    let emptyRemoved = 0
    let formattingChanges = 0
    let valueChanges = 0
    let structuralChanges = 0

    // Check for removed rows (structural change)
    if (originalRows.length !== processedRows.length) {
      structuralChanges += Math.abs(originalRows.length - processedRows.length)
    }

    // Calculate cell changes
    const minRows = Math.min(originalRows.length, processedRows.length)

    for (let i = 0; i < minRows; i++) {
      const originalRow = originalRows[i]
      const processedRow = processedRows[i]
      const minCols = Math.min(originalRow.length, processedRow.length)

      // Check for column count changes (structural change)
      if (originalRow.length !== processedRow.length) {
        structuralChanges++
      }

      for (let j = 0; j < minCols; j++) {
        totalCells++

        const originalCell = originalRow[j]?.trim() || ""
        const processedCell = processedRow[j]?.trim() || ""

        if (originalCell !== processedCell) {
          changedCells++

          // Categorize the type of change
          if (originalCell === "" && processedCell !== "") {
            emptyRemoved++
          } else if (originalCell.replace(/[\s,$%()]/g, "") === processedCell.replace(/[\s,$%()]/g, "")) {
            // If the underlying value is the same but format changed
            formattingChanges++
          } else {
            valueChanges++
          }
        }
      }
    }

    return {
      totalCells,
      changedCells,
      changePercentage: totalCells ? Math.round((changedCells / totalCells) * 100) : 0,
      emptyRemoved,
      formattingChanges,
      valueChanges,
      structuralChanges,
    }
  }, [originalData, processedData])

  // Prepare chart data
  const pieData = [
    { name: "Unchanged", value: metrics.totalCells - metrics.changedCells },
    { name: "Changed", value: metrics.changedCells },
  ]

  const changeTypeData = [
    { name: "Empty Filled", value: metrics.emptyRemoved },
    { name: "Formatting", value: metrics.formattingChanges },
    { name: "Value Changes", value: metrics.valueChanges },
    { name: "Structural", value: metrics.structuralChanges },
  ].filter((item) => item.value > 0)

  const COLORS = ["#34B76F", "#4285F4", "#FBBC05", "#EA4335", "#7E57C2"]

  if (!originalData.length || !processedData.length) {
    return (
      <Card className="csv-theme-card">
        <CardHeader className="csv-theme-header">
          <CardTitle className="csv-theme-title">
            <FileText className="csv-theme-icon" />
            Data Transformation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No data available</AlertTitle>
            <AlertDescription>
              Process your CSV file to see a comparison between the original and processed data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Ensure the charts are properly rendered
  return (
    <Card className="csv-theme-card">
      <CardHeader className="csv-theme-header">
        <CardTitle className="csv-theme-title">
          <FileText className="csv-theme-icon" />
          Data Transformation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedView} onValueChange={setSelectedView}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="details">Change Details</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4"
              >
                <MetricCard
                  title="Cells Changed"
                  value={`${metrics.changedCells}`}
                  description={`${metrics.changePercentage}% of total`}
                />
                <MetricCard
                  title="Empty Cells Filled"
                  value={`${metrics.emptyRemoved}`}
                  description={
                    metrics.changedCells
                      ? `${Math.round((metrics.emptyRemoved / metrics.changedCells) * 100)}% of changes`
                      : "0%"
                  }
                />
                <MetricCard
                  title="Format Changes"
                  value={`${metrics.formattingChanges}`}
                  description={
                    metrics.changedCells
                      ? `${Math.round((metrics.formattingChanges / metrics.changedCells) * 100)}% of changes`
                      : "0%"
                  }
                />
                <MetricCard
                  title="Value Changes"
                  value={`${metrics.valueChanges + metrics.structuralChanges}`}
                  description={
                    metrics.changedCells
                      ? `${Math.round(((metrics.valueChanges + metrics.structuralChanges) / metrics.changedCells) * 100)}% of changes`
                      : "0%"
                  }
                />
              </motion.div>
            )}

            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-csv-green-50 p-4 rounded-md mt-6"
              >
                <h3 className="font-medium mb-2 text-csv-green-800">Change Summary</h3>
                <p className="text-sm text-csv-green-700">
                  {metrics.totalCells ? (
                    metrics.changedCells > 0 ? (
                      <>
                        We made {metrics.changedCells} changes to your data, representing {metrics.changePercentage}% of
                        all cells. The changes include {metrics.emptyRemoved} empty cells filled,{" "}
                        {metrics.formattingChanges} formatting improvements, and{" "}
                        {metrics.valueChanges + metrics.structuralChanges} value or structural changes.
                      </>
                    ) : (
                      "No changes were made to your data."
                    )
                  ) : (
                    "Upload and process data to see change metrics."
                  )}
                </p>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="charts">
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : metrics.changedCells > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid md:grid-cols-2 gap-6 mt-4"
              >
                <div className="h-[300px] w-full">
                  <h3 className="text-sm font-medium mb-2 text-center">Changed vs Unchanged Cells</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        animationBegin={0}
                        animationDuration={1000}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} cells`, ""]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-[300px] w-full">
                  <h3 className="text-sm font-medium mb-2 text-center">Types of Changes</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={changeTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Number of Changes"
                        fill="#34B76F"
                        animationBegin={0}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-[300px] mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No changes detected</AlertTitle>
                  <AlertDescription>
                    No changes were detected between the original and processed data. This could mean your data was
                    already clean or the selected processing options didn't affect your data.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details">
            {isLoading ? (
              <div className="mt-4">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : metrics.changedCells > 0 ? (
              <ScrollArea className="h-[300px] mt-4">
                <div className="space-y-4 p-1">
                  {metrics.emptyRemoved > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-muted/40 p-3 rounded-md"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100"
                        >
                          Empty Cells
                        </Badge>
                        <span className="text-sm font-medium">{metrics.emptyRemoved} cells filled</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Empty cells were filled with appropriate values or removed where rows were completely empty.
                      </p>
                    </motion.div>
                  )}

                  {metrics.formattingChanges > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="bg-muted/40 p-3 rounded-md"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                        >
                          Formatting
                        </Badge>
                        <span className="text-sm font-medium">{metrics.formattingChanges} cells reformatted</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cell formatting was improved for dates, currency values, phone numbers, and other specialized
                        formats.
                      </p>
                    </motion.div>
                  )}

                  {metrics.valueChanges > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="bg-muted/40 p-3 rounded-md"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-100"
                        >
                          Value Changes
                        </Badge>
                        <span className="text-sm font-medium">{metrics.valueChanges} values modified</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cell values were modified to fix errors, evaluate formulas, or standardize content.
                      </p>
                    </motion.div>
                  )}

                  {metrics.structuralChanges > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className="bg-muted/40 p-3 rounded-md"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-100"
                        >
                          Structural
                        </Badge>
                        <span className="text-sm font-medium">{metrics.structuralChanges} structural changes</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Structural changes include removal of duplicate rows, empty rows, or empty columns.
                      </p>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[300px] mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No changes detected</AlertTitle>
                  <AlertDescription>No changes were detected between the original and processed data.</AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface MetricCardProps {
  title: string
  value: string
  description: string
}

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <div className="bg-white p-4 rounded-md border border-csv-green-200 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-csv-green-700 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-csv-green-800">{value}</p>
      <p className="text-xs text-csv-green-600 mt-1">{description}</p>
    </div>
  )
}

