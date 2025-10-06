/**
 * Contrast Migration Utility
 * Helps migrate components from hardcoded colors to theme-aware contrast system
 */

export const HARDCODED_COLOR_MAPPINGS = {
  // Text colors
  'text-white': 'text-theme-accent',
  'text-black': 'text-theme-accent',
  'text-gray-300': 'text-theme-enhancements',
  'text-gray-400': 'text-theme-enhancements',
  'text-gray-500': 'text-theme-enhancements',
  'text-gray-600': 'text-theme-enhancements',
  'text-blue-400': 'text-theme-accent',
  'text-green-400': 'text-theme-role',
  'text-red-400': 'text-red-400', // Keep red for errors
  'text-yellow-400': 'text-theme-component',
  'text-purple-400': 'text-theme-component',
  'text-orange-400': 'text-theme-component',

  // Background colors
  'bg-white': 'bg-theme-primary',
  'bg-black': 'bg-theme-primary',
  'bg-gray-800': 'bg-theme-secondary',
  'bg-gray-900': 'bg-theme-primary',
  'bg-blue-500': 'bg-theme-component',
  'bg-green-500': 'bg-theme-role',
  'bg-red-500': 'bg-red-500', // Keep red for errors
  'bg-yellow-500': 'bg-theme-component',
  'bg-purple-500': 'bg-theme-component',

  // Border colors
  'border-white': 'border-theme-accent',
  'border-gray-300': 'border-theme-enhancements',
  'border-gray-400': 'border-theme-enhancements',
  'border-blue-500': 'border-theme-component',
  'border-green-500': 'border-theme-role',
  'border-red-500': 'border-red-500', // Keep red for errors
  'border-yellow-500': 'border-theme-component',
}

export const INLINE_STYLE_MAPPINGS = {
  // Common inline style patterns
  "color: 'white'": "className='text-theme-accent'",
  "color: '#ffffff'": "className='text-theme-accent'",
  "color: '#000000'": "className='text-theme-accent'",
  "color: 'var(--theme-accent)'": "className='text-theme-accent'",
  "backgroundColor: 'white'": "className='bg-theme-primary'",
  "backgroundColor: '#ffffff'": "className='bg-theme-primary'",
  "backgroundColor: '#000000'": "className='bg-theme-primary'",
}

/**
 * Convert hardcoded Tailwind classes to theme-aware classes
 */
export function convertHardcodedClasses(className: string): string {
  let converted = className

  Object.entries(HARDCODED_COLOR_MAPPINGS).forEach(([hardcoded, themeAware]) => {
    const regex = new RegExp(`\\b${hardcoded}\\b`, 'g')
    converted = converted.replace(regex, themeAware)
  })

  return converted
}

/**
 * Convert inline styles to theme-aware classes where possible
 */
export function convertInlineStyles(styleString: string): { className: string; style: string } {
  let className = ''
  let style = styleString

  Object.entries(INLINE_STYLE_MAPPINGS).forEach(([inlineStyle, themeClass]) => {
    if (style.includes(inlineStyle)) {
      className += ` ${themeClass}`
      style = style.replace(inlineStyle, '')
    }
  })

  return { className: className.trim(), style: style.trim() }
}

/**
 * Get theme-aware component recommendations
 */
export function getComponentRecommendations(elementType: string, currentClasses: string): string[] {
  const recommendations: string[] = []

  // Button recommendations
  if (elementType === 'button' || currentClasses.includes('btn')) {
    recommendations.push('Use <ContrastButton> component')
    recommendations.push('Apply variant="default|primary|secondary|accent|role|component"')
  }

  // Card recommendations
  if (elementType === 'div' && (currentClasses.includes('card') || currentClasses.includes('bg-white'))) {
    recommendations.push('Use <ContrastCard> component')
    recommendations.push('Apply variant="default|elevated|outlined|filled"')
  }

  // Text recommendations
  if (elementType === 'span' || elementType === 'p' || elementType === 'h1' || elementType === 'h2' || elementType === 'h3') {
    recommendations.push('Use <ContrastText> component')
    recommendations.push('Apply variant="default|primary|secondary|accent|role|component|enhancements"')
  }

  // Input recommendations
  if (elementType === 'input') {
    recommendations.push('Use <ContrastInput> component')
    recommendations.push('Built-in focus states and contrast validation')
  }

  return recommendations
}

/**
 * Generate migration suggestions for a component
 */
export function generateMigrationSuggestions(componentCode: string): string[] {
  const suggestions: string[] = []

  // Check for hardcoded colors
  const hardcodedColors = Object.keys(HARDCODED_COLOR_MAPPINGS)
  const foundHardcoded = hardcodedColors.filter(color => componentCode.includes(color))
  
  if (foundHardcoded.length > 0) {
    suggestions.push(`Found hardcoded colors: ${foundHardcoded.join(', ')}`)
    suggestions.push('Replace with theme-aware classes:')
    foundHardcoded.forEach(color => {
      suggestions.push(`  ${color} → ${HARDCODED_COLOR_MAPPINGS[color as keyof typeof HARDCODED_COLOR_MAPPINGS]}`)
    })
  }

  // Check for inline styles
  if (componentCode.includes("style={{") && componentCode.includes("color:")) {
    suggestions.push('Replace inline color styles with theme-aware classes')
    suggestions.push('Consider using <ContrastText> component for dynamic text colors')
  }

  // Check for glass effects
  if (componentCode.includes('backdrop-blur') || componentCode.includes('bg-white/10')) {
    suggestions.push('Consider using <ContrastCard variant="elevated"> for glass effects')
  }

  return suggestions
}

/**
 * Common contrast issues to watch for
 */
export const COMMON_CONTRAST_ISSUES = [
  'White text on white backgrounds',
  'Light gray text on light backgrounds',
  'Hardcoded color values that don\'t adapt to themes',
  'Missing focus states for interactive elements',
  'Insufficient contrast ratios for status indicators',
  'Theme switching that breaks text visibility',
]

/**
 * WCAG compliance checklist
 */
export const WCAG_COMPLIANCE_CHECKLIST = [
  'Text contrast ratio ≥ 4.5:1 for normal text',
  'Text contrast ratio ≥ 3:1 for large text',
  'Interactive elements have clear focus indicators',
  'Color is not the only means of conveying information',
  'Text remains readable when zoomed to 200%',
  'High contrast mode support',
  'Reduced motion preferences respected',
]
