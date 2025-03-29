"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle2 } from "lucide-react"

interface CsvAnimationProps {
  isProcessing: boolean
  originalData: string[][]
  processedData: string[][]
  onClose?: () => void
}

export function CsvAnimation({ isProcessing, originalData, processedData, onClose }: CsvAnimationProps) {
  const [animationStep, setAnimationStep] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (isProcessing) {
      setShowAnimation(true)
      setAnimationStep(0)
      setIsComplete(false)

      // Simulate processing steps with realistic timing
      const timings = [800, 1200, 1000, 1100, 900]
      let currentStep = 0

      const runNextStep = () => {
        if (currentStep < timings.length) {
          setTimeout(() => {
            setAnimationStep(currentStep + 1)
            currentStep++
            runNextStep()
          }, timings[currentStep])
        } else {
          setIsComplete(true)
        }
      }

      runNextStep()
    } else if (processedData.length > 0) {
      // When processing is done but we have data, ensure we show completion
      setIsComplete(true)
      setAnimationStep(5)
    }
  }, [isProcessing, processedData.length])

  // Hide animation after completion
  useEffect(() => {
    if (isComplete && !isProcessing) {
      const timeout = setTimeout(() => {
        if (onClose) {
          onClose()
        } else {
          setShowAnimation(false)
        }
      }, 1500)

      return () => clearTimeout(timeout)
    }
  }, [isComplete, isProcessing, onClose])

  if (!showAnimation) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card rounded-lg shadow-lg p-8 max-w-md w-full"
      >
        <div className="flex flex-col items-center space-y-6">
          {!isComplete ? (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </motion.div>
          )}

          <h3 className="text-xl font-semibold">{isComplete ? "Processing Complete!" : "Processing Your CSV"}</h3>

          <div className="w-full space-y-6">
            <AnimationStep step={1} currentStep={animationStep} label="Analyzing data structure" />
            <AnimationStep step={2} currentStep={animationStep} label="Cleaning empty rows and whitespace" />
            <AnimationStep step={3} currentStep={animationStep} label="Standardizing formats" />
            <AnimationStep step={4} currentStep={animationStep} label="Removing duplicates" />
            <AnimationStep step={5} currentStep={animationStep} label="Finalizing processed data" />
          </div>

          <div className="text-sm text-muted-foreground">
            {!isComplete ? "Please wait while we process your data..." : "Your CSV has been successfully processed!"}
          </div>

          {isComplete && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <button
                onClick={() => setShowAnimation(false)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Continue
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

interface AnimationStepProps {
  step: number
  currentStep: number
  label: string
}

function AnimationStep({ step, currentStep, label }: AnimationStepProps) {
  const isActive = currentStep >= step
  const isComplete = currentStep > step

  return (
    <div className="flex items-center space-x-3">
      <motion.div
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{
          scale: isActive ? 1 : 0.8,
          opacity: isActive ? 1 : 0.5,
        }}
        className="relative h-8 w-8 flex items-center justify-center"
      >
        {/* Circle background */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ backgroundColor: "var(--muted)" }}
          animate={{
            backgroundColor: isActive ? (isComplete ? "var(--green-500)" : "var(--primary)") : "var(--muted)",
          }}
        />

        {/* Step number or checkmark */}
        {isComplete ? (
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white relative z-10"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </motion.svg>
        ) : (
          <span
            className={`relative z-10 text-sm font-medium ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
          >
            {step}
          </span>
        )}
      </motion.div>

      <div className="flex-1">
        <motion.span
          animate={{
            opacity: isActive ? 1 : 0.5,
            fontWeight: isActive ? 500 : 400,
          }}
          className="text-sm"
        >
          {label}
        </motion.span>

        {/* Progress bar for active step */}
        {isActive && !isComplete && (
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2 }}
            className="h-1 bg-primary/30 mt-1 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-primary"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          </motion.div>
        )}

        {/* Completed indicator */}
        {isComplete && (
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
            className="h-1 bg-green-500 mt-1 rounded-full"
          />
        )}
      </div>
    </div>
  )
}

