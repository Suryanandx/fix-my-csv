"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X, Calculator, ActivityIcon as Function } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FormulaEditorProps {
  value: string
  onSave: (formula: string) => void
  onCancel: () => void
  cellReference?: string
}

export function FormulaEditor({ value, onSave, onCancel, cellReference }: FormulaEditorProps) {
  const [formula, setFormula] = useState(value.startsWith("=") ? value : `=${value}`)
  const [isValid, setIsValid] = useState(true)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const validateFormula = (input: string): boolean => {
    if (!input.startsWith("=")) {
      setError("Formula must start with '='")
      return false
    }

    // Basic validation - check for balanced parentheses
    const stack: string[] = []
    for (const char of input) {
      if (char === "(") {
        stack.push(char)
      } else if (char === ")") {
        if (stack.length === 0) {
          setError("Unbalanced parentheses")
          return false
        }
        stack.pop()
      }
    }

    if (stack.length > 0) {
      setError("Unbalanced parentheses")
      return false
    }

    // Check for common functions
    const formulaContent = input.substring(1).trim()
    if (formulaContent.length === 0) {
      setError("Formula cannot be empty")
      return false
    }

    // Check for division by zero
    if (/\/\s*0(?![.\d])/.test(formulaContent)) {
      setError("Division by zero")
      return false
    }

    setError("")
    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormula = e.target.value
    setFormula(newFormula)
    setIsValid(validateFormula(newFormula))
  }

  const handleSave = () => {
    if (isValid) {
      onSave(formula)
    }
  }

  const insertFunction = (func: string) => {
    setFormula((prev) => {
      const newFormula = prev.endsWith("=") ? `=${func}()` : `${prev}${func}()`
      setIsValid(validateFormula(newFormula))
      return newFormula
    })
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const formatFormula = (formula: string) => {
    if (!formula.startsWith("=")) return formula

    // This is a simple formatter that highlights different parts of the formula
    // In a real app, you'd want a more sophisticated parser
    const content = formula.substring(1)

    // Replace functions with highlighted versions
    const highlightedContent = content
      .replace(
        /\b(SUM|AVERAGE|COUNT|MAX|MIN|IF|AND|OR|NOT|ROUND|FLOOR|CEILING)\b/g,
        '<span class="csv-formula-function">$1</span>',
      )
      .replace(/([+\-*/^=<>])/g, '<span class="csv-formula-operator">$1</span>')
      .replace(/([A-Z]+\d+)/g, '<span class="csv-formula-reference">$1</span>')

    return `<span class="csv-formula-highlight">=</span>${highlightedContent}`
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-800 flex items-center">
          <Calculator className="h-4 w-4 mr-2 text-csv-green-600" />
          Formula Editor
          {cellReference && (
            <Badge className="ml-2 bg-csv-green-100 text-csv-green-800 border-csv-green-200">{cellReference}</Badge>
          )}
        </h3>
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-csv-green-600"
                  onClick={() => insertFunction("SUM")}
                >
                  Σ
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Insert SUM function</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-csv-green-600"
                  onClick={() => insertFunction("AVERAGE")}
                >
                  x̄
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Insert AVERAGE function</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertFunction("COUNT")}>
                  #
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Insert COUNT function</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <Function className="h-4 w-4 mr-1" />
                More
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Insert Function</DialogTitle>
                <DialogDescription>Choose a function to insert into your formula.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2 py-4">
                {["SUM", "AVERAGE", "COUNT", "MAX", "MIN", "IF", "AND", "OR", "NOT", "ROUND"].map((func) => (
                  <Button
                    key={func}
                    variant="outline"
                    onClick={() => {
                      insertFunction(func)
                    }}
                    className="justify-start"
                  >
                    {func}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="formula-input" className="text-sm text-gray-600">
            Formula
          </Label>
          <Input
            ref={inputRef}
            id="formula-input"
            value={formula}
            onChange={handleChange}
            className="csv-formula-editor font-mono"
            placeholder="=SUM(A1:A10)"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <Label className="text-xs text-gray-500 block mb-1">Preview</Label>
          <div
            className="csv-formula-editor min-h-[24px]"
            dangerouslySetInnerHTML={{ __html: formatFormula(formula) }}
          />
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isValid}
            className="bg-csv-green-600 hover:bg-csv-green-700"
          >
            <Check className="h-4 w-4 mr-1" />
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}

export function FormulaHelperDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Function className="h-4 w-4" />
          <span>Formula Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Formula Reference</DialogTitle>
          <DialogDescription>Common functions and operators you can use in your formulas.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <h4 className="font-medium mb-2 text-csv-green-700">Basic Functions</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">SUM(range)</span> - Sum of values
              </li>
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">AVERAGE(range)</span> - Average of values
              </li>
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">COUNT(range)</span> - Count of values
              </li>
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">MAX(range)</span> - Maximum value
              </li>
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">MIN(range)</span> - Minimum value
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-csv-green-700">Operators</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">+</span> - Addition
              </li>
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">-</span> - Subtraction
              </li>
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">*</span> - Multiplication
              </li>
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">/</span> - Division
              </li>
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">^</span> - Exponentiation
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-csv-green-700">Date Functions</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">YEAR(date)</span> - Extract year
              </li>
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">MONTH(date)</span> - Extract month
              </li>
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">DAY(date)</span> - Extract day
              </li>
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">TODAY()</span> - Current date
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-csv-green-700">Examples</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">=A1+A2</span> - Add cells A1 and A2
              </li>
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">=SUM(A1:A10)</span> - Sum range A1 to A10
              </li>
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">=B1*0.1</span> - Calculate 10% of B1
              </li>
              <li>
                <span className="font-mono bg-gray-100 px-1 rounded">=2023-YEAR(C5)</span> - Calculate age
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

