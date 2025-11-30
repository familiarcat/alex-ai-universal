/**
 * Dynamic Favicon API
 * 
 * GET /api/favicon
 * 
 * Generates SVG favicon dynamically based on crew analysis of project status
 * 
 * Crew Collaboration:
 * - Commander Data: Analyzes system metrics and determines status level
 * - Counselor Troi: Applies color theory and design harmony
 * - Geordi La Forge: Monitors infrastructure health
 * - Captain Picard: Strategic status assessment
 * 
 * Status Levels:
 * - Optimal (green): All systems operational, crew active
 * - Good (cyan): Minor issues, overall healthy
 * - Warning (gold): Some concerns, attention needed
 * - Critical (red): Significant issues requiring action
 */

import { NextRequest, NextResponse } from 'next/server';

interface ProjectStatus {
  level: 'optimal' | 'good' | 'warning' | 'critical';
  score: number; // 0-100
  indicators: {
    systems: 'online' | 'degraded' | 'offline';
    crew: 'active' | 'partial' | 'inactive';
    infrastructure: 'healthy' | 'warning' | 'critical';
  };
}

/**
 * Analyze project status using crew metrics
 * Data's analytical approach + La Forge's infrastructure monitoring
 */
async function analyzeProjectStatus(): Promise<ProjectStatus> {
  try {
    // Check MCP system status
    const mcpStatus = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mcp/status`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    }).catch(() => null);

    let systemsStatus: 'online' | 'degraded' | 'offline' = 'online';
    let infrastructureStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    let score = 100;

    if (mcpStatus?.ok) {
      try {
        const mcpData = await mcpStatus.json();
        const services = mcpData.services || {};
        
        // Count online services
        const serviceCount = Object.keys(services).length;
        const onlineCount = Object.values(services).filter((s: any) => s?.status === 'online').length;
        const onlineRatio = serviceCount > 0 ? onlineCount / serviceCount : 1;

        if (onlineRatio >= 0.9) {
          systemsStatus = 'online';
          score = 100;
        } else if (onlineRatio >= 0.7) {
          systemsStatus = 'degraded';
          score = 75;
          infrastructureStatus = 'warning';
        } else {
          systemsStatus = 'offline';
          score = 40;
          infrastructureStatus = 'critical';
        }
      } catch (e) {
        // If we can't parse, assume degraded
        systemsStatus = 'degraded';
        score = 60;
        infrastructureStatus = 'warning';
      }
    } else {
      // Can't reach status endpoint - assume warning
      systemsStatus = 'degraded';
      score = 60;
      infrastructureStatus = 'warning';
    }

    // Determine overall status level
    let level: 'optimal' | 'good' | 'warning' | 'critical';
    if (score >= 90) {
      level = 'optimal';
    } else if (score >= 70) {
      level = 'good';
    } else if (score >= 50) {
      level = 'warning';
    } else {
      level = 'critical';
    }

    return {
      level,
      score,
      indicators: {
        systems: systemsStatus,
        crew: systemsStatus === 'online' ? 'active' : systemsStatus === 'degraded' ? 'partial' : 'inactive',
        infrastructure: infrastructureStatus
      }
    };
  } catch (error) {
    // Default to warning if analysis fails
    return {
      level: 'warning',
      score: 60,
      indicators: {
        systems: 'degraded',
        crew: 'partial',
        infrastructure: 'warning'
      }
    };
  }
}

/**
 * Generate SVG favicon based on status
 * Troi's color theory + Data's precision
 */
function generateFaviconSVG(status: ProjectStatus): string {
  // Color palette based on status (Troi's color theory)
  const colors = {
    optimal: {
      primary: '#00ffaa',    // Bright cyan-green (active, healthy)
      accent: '#FFD700',    // Gold (excellence)
      bg: '#0b0b10',        // Deep space
      indicator: '#00ffaa'   // Green status dot
    },
    good: {
      primary: '#00d9ff',    // Cyan (good, stable)
      accent: '#FFD700',
      bg: '#0b0b10',
      indicator: '#00d9ff'
    },
    warning: {
      primary: '#FF9900',    // LCARS orange (attention needed)
      accent: '#FFD700',
      bg: '#0b0b10',
      indicator: '#FF9900'
    },
    critical: {
      primary: '#ff4444',    // Red (critical)
      accent: '#FF9900',
      bg: '#0b0b10',
      indicator: '#ff4444'
    }
  };

  const palette = colors[status.level];
  const { score } = status;

  // Status ring opacity based on score (Data's analytical precision)
  const ringOpacity = Math.max(0.3, score / 100);
  
  // Status indicator pulse animation for active systems
  const pulseAnimation = status.level === 'optimal' || status.level === 'good' 
    ? `<animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <!-- Background: Deep space blue representing the crew's mission -->
  <rect width="64" height="64" fill="${palette.bg}" rx="8"/>
  
  <!-- Status ring: Opacity reflects system health (Data's metrics) -->
  <circle cx="32" cy="32" r="24" fill="none" stroke="${palette.primary}" stroke-width="2" opacity="${ringOpacity}"/>
  
  <!-- Central "A" for Alex AI: Color reflects status (Troi's visual communication) -->
  <path d="M 32 12 L 24 28 L 40 28 Z" fill="${palette.primary}" opacity="0.9"/>
  <rect x="28" y="28" width="8" height="16" fill="${palette.primary}" opacity="0.9"/>
  
  <!-- Star Trek gold accent: Represents crew coordination -->
  <circle cx="32" cy="32" r="18" fill="none" stroke="${palette.accent}" stroke-width="1.5" opacity="0.4"/>
  
  <!-- LCARS-inspired corner elements: Status indicators -->
  <rect x="4" y="4" width="8" height="2" fill="${palette.primary}" rx="1" opacity="0.8"/>
  <rect x="52" y="4" width="8" height="2" fill="${palette.primary}" rx="1" opacity="0.8"/>
  <rect x="4" y="58" width="8" height="2" fill="${palette.primary}" rx="1" opacity="0.8"/>
  <rect x="52" y="58" width="8" height="2" fill="${palette.primary}" rx="1" opacity="0.8"/>
  
  <!-- Status indicator: Pulsing for active, solid for issues -->
  <circle cx="48" cy="16" r="3" fill="${palette.indicator}">
    ${pulseAnimation}
  </circle>
  
  <!-- Score indicator: Visual representation of health score (Data's precision) -->
  <circle cx="32" cy="32" r="20" fill="none" stroke="${palette.primary}" stroke-width="2" 
          stroke-dasharray="${2 * Math.PI * 20}" 
          stroke-dashoffset="${2 * Math.PI * 20 * (1 - score / 100)}"
          opacity="0.3" transform="rotate(-90 32 32)"/>
  
  <!-- Subtle glow effect: Intensity reflects status -->
  <circle cx="32" cy="32" r="20" fill="url(#glow-${status.level})" opacity="${status.level === 'optimal' ? 0.3 : 0.15}"/>
  
  <defs>
    <radialGradient id="glow-${status.level}" cx="50%" cy="50%">
      <stop offset="0%" stop-color="${palette.primary}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${palette.primary}" stop-opacity="0"/>
    </radialGradient>
  </defs>
</svg>`;
}

export async function GET(request: NextRequest) {
  try {
    // Analyze project status using crew metrics
    const status = await analyzeProjectStatus();
    
    // Generate SVG favicon
    const svg = generateFaviconSVG(status);
    
    // Return with appropriate headers
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=30, s-maxage=30', // Cache for 30 seconds
        'X-Status-Level': status.level,
        'X-Status-Score': status.score.toString(),
      },
    });
  } catch (error: any) {
    // Fallback to default favicon on error
    const defaultSVG = generateFaviconSVG({
      level: 'warning',
      score: 60,
      indicators: {
        systems: 'degraded',
        crew: 'partial',
        infrastructure: 'warning'
      }
    });
    
    return new NextResponse(defaultSVG, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=10',
      },
      status: 200, // Still return 200 to avoid breaking favicon display
    });
  }
}

