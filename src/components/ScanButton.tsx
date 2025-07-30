import React from 'react'
import { Zap, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScanButtonProps {
  onClick: () => void
  isScanning: boolean
  disabled?: boolean
  className?: string
}

const ScanButton: React.FC<ScanButtonProps> = ({
  onClick,
  isScanning,
  disabled = false,
  className
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isScanning}
      className={cn(
        "btn-primary flex items-center space-x-2 transition-all duration-200",
        (disabled || isScanning) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {isScanning ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Scanning...</span>
        </>
      ) : (
        <>
          <Zap className="w-4 h-4" />
          <span>Scan Page</span>
        </>
      )}
    </button>
  )
}

export default ScanButton 