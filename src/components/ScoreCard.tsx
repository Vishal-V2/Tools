import React from 'react'
import { cn } from '@/lib/utils'

interface ScoreCardProps {
  title: string
  score: number
  color: 'primary' | 'warning' | 'danger' | 'success'
  className?: string
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, color, className }) => {
  const getColorClasses = (colorType: string) => {
    switch (colorType) {
      case 'primary':
        return 'text-primary-600'
      case 'warning':
        return 'text-warning-600'
      case 'danger':
        return 'text-danger-600'
      case 'success':
        return 'text-success-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className={cn(
      "text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg",
      className
    )}>
      <div className={cn("text-2xl font-bold", getColorClasses(color))}>
        {score}%
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400">
        {title}
      </div>
    </div>
  )
}

export default ScoreCard 