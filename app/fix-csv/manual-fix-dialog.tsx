"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Edit2, Check, X } from "lucide-react"
import { FormulaEditor } from "./formula-editor"
import { Badge } from "@/components/ui/badge"

interface ManualFixDialogProps {
  value: string
  columnName: string
  columnType: string
  rowIndex: number
  colIndex: number
  onSave: (value: string) => void
}

export function ManualFixDialog({ value, columnName, columnType, rowIndex, colIndex, onSave }: ManualFixDialogProps) {
  const [open, setOpen] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [date, setDate] = useState<Date | undefined>(value && isLikelyDate(value) ? new Date(value) : undefined)
  const [isFormulaMode, setIsFormulaMode] = useState(value.startsWith("="))

  const handleSave = () => {
    if (columnType === "date" && date) {
      onSave(format(date, "yyyy-MM-dd"))
    } else if (isFormulaMode) {
      // Formula will be saved via the FormulaEditor component
    } else {
      onSave(editValue)
    }
    setOpen(false)
  }

  const handleFormulaChange = (formula: string) => {
    setEditValue(formula)
    onSave(formula)
    setOpen(false)
  }

  const getCellReference = () => {
    const colLetter = String.fromCharCode(65 + colIndex)
    return `${colLetter}${rowIndex + 1}`
  }

  const renderEditor = () => {
    if (isFormulaMode) {
      return (
        <FormulaEditor
          value={editValue}
          onSave={handleFormulaChange}
          onCancel={() => setOpen(false)}
          cellReference={getCellReference()}
        />
      )
    }

    switch (columnType) {
      case "date":
        return (
          <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Edit Date</h3>
                <p className="text-sm text-gray-500">Select a date from the calendar</p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {getCellReference()}
              </Badge>
            </div>

            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-csv-green-600 hover:bg-csv-green-700">
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        )

      case "currency":
        return (
          <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Edit Currency Value</h3>
                <p className="text-sm text-gray-500">Enter a numeric value</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {getCellReference()}
              </Badge>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currency-input">Value</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="currency-input"
                  value={editValue.replace(/[^\d.-]/g, "")}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="pl-7"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-csv-green-600 hover:bg-csv-green-700">
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        )

      case "phone":
        return (
          <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Edit Phone Number</h3>
                <p className="text-sm text-gray-500">Enter a valid phone number</p>
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                {getCellReference()}
              </Badge>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone-input">Phone Number</Label>
              <Input
                id="phone-input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="(555) 123-4567"
              />
              <p className="text-xs text-gray-500">Will be formatted as (XXX) XXX-XXXX</p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-csv-green-600 hover:bg-csv-green-700">
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Edit Value</h3>
                <p className="text-sm text-gray-500">Edit the cell value</p>
              </div>
              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                {getCellReference()}
              </Badge>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="value-input">{columnName}</Label>
              <Input id="value-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" size="sm" onClick={() => setIsFormulaMode(true)} className="text-blue-600">
                Switch to Formula
              </Button>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-csv-green-600 hover:bg-csv-green-700">
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0">{renderEditor()}</DialogContent>
    </Dialog>
  )
}

// Helper to check if a value is likely a date
function isLikelyDate(value: string): boolean {
  const datePatterns = [
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/,
    /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/,
    /^\d{1,2}[-/]\d{1,2}[-/]\d{2}$/,
  ]

  return datePatterns.some((pattern) => pattern.test(value)) || !isNaN(Date.parse(value))
}

