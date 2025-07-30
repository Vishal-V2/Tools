import React from 'react'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RiskIndicatorProps {
  risk: 'low' | 'medium' | 'high'
  className?: string
}

const RiskIndicator: React.FC<RiskIndicatorProps> = ({ risk, className }) => {
  const getRiskConfig = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return {
          icon: <CheckCircle className="w-5 h-5 text-success-600" />,
          color: 'text-success-600 dark:text-success-400',
          bgColor: 'bg-success-50 dark:bg-success-900/20'
        }
      case 'medium':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-warning-600" />,
          color: 'text-warning-600 dark:text-warning-400',
          bgColor: 'bg-warning-50 dark:bg-warning-900/20'
        }
      case 'high':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-danger-600" />,
          color: 'text-danger-600 dark:text-danger-400',
          bgColor: 'bg-danger-50 dark:bg-danger-900/20'
        }
      default:
        return {
          icon: <Info className="w-5 h-5 text-gray-600" />,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-800'
        }
    }
  }

  const config = getRiskConfig(risk)

  return (
    <div className={cn(
      "flex items-center space-x-2 px-3 py-2 rounded-lg",
      config.bgColor,
      className
    )}>
      {config.icon}
      <span className={cn("font-medium text-sm", config.color)}>
        {risk.toUpperCase()}
      </span>
    </div>
  )
}

export default RiskIndicator 