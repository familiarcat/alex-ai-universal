'use client'

import { useState, ReactNode, useRef, useEffect } from 'react'

interface HoverTooltipProps {
  children: ReactNode
  title: string
  description: string
  status: 'implemented' | 'partial' | 'not-implemented'
  implementationLevel?: number
  requirements?: string[]
  className?: string
}

export default function HoverTooltip({
  children,
  title,
  description,
  status,
  implementationLevel = 0,
  requirements = [],
  className = ''
}: HoverTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const getStatusColor = () => {
    switch (status) {
      case 'implemented':
        return 'border-green-500 bg-green-900/95 backdrop-blur-md shadow-2xl'
      case 'partial':
        return 'border-yellow-500 bg-yellow-900/95 backdrop-blur-md shadow-2xl'
      case 'not-implemented':
        return 'border-red-500 bg-red-900/95 backdrop-blur-md shadow-2xl'
      default:
        return 'border-gray-500 bg-gray-900/95 backdrop-blur-md shadow-2xl'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'implemented':
        return '✅'
      case 'partial':
        return '⚠️'
      case 'not-implemented':
        return '❌'
      default:
        return '❓'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'implemented':
        return 'Fully Implemented'
      case 'partial':
        return 'Partially Implemented'
      case 'not-implemented':
        return 'Not Implemented'
      default:
        return 'Unknown Status'
    }
  }

  const calculatePosition = () => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const tooltipWidth = 320 // w-80 = 320px
    const tooltipHeight = 384 // max-h-96 = 384px
    const margin = 8

    let top = rect.bottom + margin
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2)

    // Adjust horizontal position if tooltip would overflow
    if (left < margin) {
      left = margin
    } else if (left + tooltipWidth > viewportWidth - margin) {
      left = viewportWidth - tooltipWidth - margin
    }

    // Adjust vertical position if tooltip would overflow bottom
    if (top + tooltipHeight > viewportHeight - margin) {
      top = rect.top - tooltipHeight - margin
    }

    // Ensure tooltip doesn't go above viewport
    if (top < margin) {
      top = margin
    }

    setPosition({ top, left })
  }

  const handleMouseEnter = () => {
    calculatePosition()
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  useEffect(() => {
    if (isVisible) {
      calculatePosition()
    }
  }, [isVisible])

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <>
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 z-[9998] backdrop-blur-md bg-black/20 pointer-events-none animate-fade-in"
            style={{ zIndex: 9998 }}
          />
          
          {/* Tooltip content */}
          <div 
            ref={tooltipRef}
            className={`fixed z-[9999] w-80 max-h-96 p-4 rounded-lg border ${getStatusColor()} ring-2 ring-white/20 shadow-2xl overflow-hidden animate-slide-up`}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              pointerEvents: 'auto',
              zIndex: 9999
            }}
          >
          {/* Scrollable Content Container */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 sticky top-0 bg-inherit backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getStatusIcon()}</span>
                <h3 className="font-bold text-white">{title}</h3>
              </div>
              <div className="text-xs text-gray-300">
                {getStatusText()}
              </div>
            </div>

            {/* Description */}
            <div className="mb-3">
              <p className="text-sm text-gray-300 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Implementation Level */}
            {implementationLevel > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Implementation Level</span>
                  <span>{implementationLevel}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      implementationLevel >= 80 ? 'bg-green-500' :
                      implementationLevel >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${implementationLevel}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <div className="border-t border-white/20 pt-3">
                <h4 className="text-xs font-bold text-white mb-2">Implementation Requirements:</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-1">
                      <span className="text-gray-500 mt-0.5 flex-shrink-0">•</span>
                      <span className="break-words">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>
        </>
      )}
    </div>
  )
}
