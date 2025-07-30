import React from 'react'
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AnalysisStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'loading' | 'completed' | 'error'
  error?: string
}

interface AnalysisProgressProps {
  steps: AnalysisStep[]
  className?: string
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ steps, className }) => {
  const getStepIcon = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success-600" />
      case 'loading':
        return <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-danger-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStepTextColor = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-success-600 dark:text-success-400'
      case 'loading':
        return 'text-primary-600 dark:text-primary-400'
      case 'error':
        return 'text-danger-600 dark:text-danger-400'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  const getStepBgColor = (status: AnalysisStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success-50 dark:bg-success-900/20'
      case 'loading':
        return 'bg-primary-50 dark:bg-primary-900/20'
      case 'error':
        return 'bg-danger-50 dark:bg-danger-900/20'
      default:
        return 'bg-gray-50 dark:bg-gray-800'
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Analysis Progress</h3>
        <div className="text-sm text-gray-500">
          {steps.filter(s => s.status === 'completed').length} / {steps.length} completed
        </div>
      </div>
      
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "flex items-start space-x-3 p-3 rounded-lg transition-all duration-200",
              getStepBgColor(step.status)
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStepIcon(step.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={cn(
                  "text-sm font-medium",
                  getStepTextColor(step.status)
                )}>
                  {step.title}
                </h4>
                {step.status === 'loading' && (
                  <div className="text-xs text-primary-600 animate-pulse">
                    Processing...
                  </div>
                )}
              </div>
              
              <p className={cn(
                "text-xs mt-1",
                step.status === 'error' ? 'text-danger-600' : 'text-gray-600 dark:text-gray-400'
              )}>
                {step.status === 'error' && step.error ? step.error : step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default AnalysisProgress 