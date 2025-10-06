'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { getContrastRatio, ensureMinContrast } from '@/utils/contrastUtils'

interface ContrastAwareProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  textColor?: string
  backgroundColor?: string
  minContrast?: number
  fallbackTextColor?: string
  fallbackBackgroundColor?: string
}

/**
 * Universal contrast-aware component that ensures proper contrast ratios
 */
export default function ContrastAware({
  children,
  className = '',
  style = {},
  textColor,
  backgroundColor,
  minContrast = 4.5,
  fallbackTextColor,
  fallbackBackgroundColor,
  ...props
}: ContrastAwareProps) {
  const { currentTheme } = useTheme()

  // Get theme-appropriate colors if not provided
  const resolvedTextColor = textColor || `var(--theme-accent)`
  const resolvedBackgroundColor = backgroundColor || `var(--theme-primary)`

  // Ensure minimum contrast
  const finalTextColor = ensureMinContrast(
    resolvedBackgroundColor,
    resolvedTextColor,
    minContrast
  )

  // Apply theme-aware classes
  const themeClasses = `theme-${currentTheme.id} contrast-aware`

  return (
    <div
      className={`${themeClasses} ${className}`}
      style={{
        ...style,
        color: finalTextColor,
        backgroundColor: resolvedBackgroundColor,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Contrast-aware text component
 */
export function ContrastText({
  children,
  className = '',
  style = {},
  variant = 'default',
  ...props
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'role' | 'component' | 'enhancements'
}) {
  const { currentTheme } = useTheme()

  const getVariantColor = () => {
    switch (variant) {
      case 'primary':
        return 'var(--theme-primary)'
      case 'secondary':
        return 'var(--theme-secondary)'
      case 'accent':
        return 'var(--theme-accent)'
      case 'role':
        return 'var(--theme-role)'
      case 'component':
        return 'var(--theme-component)'
      case 'enhancements':
        return 'var(--theme-enhancements)'
      default:
        return 'var(--theme-accent)'
    }
  }

  return (
    <span
      className={`contrast-text variant-${variant} ${className}`}
      style={{
        ...style,
        color: getVariantColor(),
      }}
      {...props}
    >
      {children}
    </span>
  )
}

/**
 * Contrast-aware button component
 */
export function ContrastButton({
  children,
  className = '',
  style = {},
  variant = 'default',
  onClick,
  disabled = false,
  ...props
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'role' | 'component'
  onClick?: () => void
  disabled?: boolean
}) {
  const { currentTheme } = useTheme()

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--theme-primary)',
          color: 'var(--theme-accent)',
          borderColor: 'var(--theme-primary)'
        }
      case 'secondary':
        return {
          backgroundColor: 'var(--theme-secondary)',
          color: 'var(--theme-accent)',
          borderColor: 'var(--theme-secondary)'
        }
      case 'accent':
        return {
          backgroundColor: 'var(--theme-accent)',
          color: 'var(--theme-primary)',
          borderColor: 'var(--theme-accent)'
        }
      case 'role':
        return {
          backgroundColor: 'var(--theme-role)',
          color: 'var(--theme-primary)',
          borderColor: 'var(--theme-role)'
        }
      case 'component':
        return {
          backgroundColor: 'var(--theme-component)',
          color: 'var(--theme-primary)',
          borderColor: 'var(--theme-component)'
        }
      default:
        return {
          backgroundColor: 'transparent',
          color: 'var(--theme-accent)',
          borderColor: 'var(--theme-enhancements)'
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <button
      className={`contrast-button variant-${variant} ${className}`}
      style={{
        ...style,
        ...variantStyles,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Contrast-aware card component
 */
export function ContrastCard({
  children,
  className = '',
  style = {},
  variant = 'default',
  ...props
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  variant?: 'default' | 'elevated' | 'outlined' | 'filled'
}) {
  const { currentTheme } = useTheme()

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: 'var(--theme-secondary)',
          color: 'var(--theme-accent)',
          border: '1px solid var(--theme-enhancements)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          color: 'var(--theme-accent)',
          border: '2px solid var(--theme-enhancements)'
        }
      case 'filled':
        return {
          backgroundColor: 'var(--theme-secondary)',
          color: 'var(--theme-accent)',
          border: '1px solid var(--theme-secondary)'
        }
      default:
        return {
          backgroundColor: 'color-mix(in srgb, var(--theme-primary) 90%, transparent)',
          color: 'var(--theme-accent)',
          border: '1px solid color-mix(in srgb, var(--theme-accent) 20%, transparent)'
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <div
      className={`contrast-card variant-${variant} ${className}`}
      style={{
        ...style,
        ...variantStyles,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Contrast-aware input component
 */
export function ContrastInput({
  className = '',
  style = {},
  placeholder,
  value,
  onChange,
  disabled = false,
  ...props
}: {
  className?: string
  style?: React.CSSProperties
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}) {
  const { currentTheme } = useTheme()

  return (
    <input
      className={`contrast-input ${className}`}
      style={{
        ...style,
        backgroundColor: 'var(--theme-secondary)',
        color: 'var(--theme-accent)',
        border: '2px solid var(--theme-enhancements)',
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s ease',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
      }}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--theme-component)'
        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'var(--theme-enhancements)'
        e.target.style.boxShadow = 'none'
      }}
      {...props}
    />
  )
}


