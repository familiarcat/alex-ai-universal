/**
 * 🖖 Alex AI Configuration Dashboard - Production Configuration
 * 
 * This file contains production environment configuration for deployment
 * on Vercel, Docker, AWS Lambda, or other cloud platforms.
 */

module.exports = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        dashboardPort: process.env.DASHBOARD_PORT || 3001,
        environment: process.env.NODE_ENV || 'production',
        serverType: process.env.SERVER_TYPE || 'production'
    },

    // Production Features
    features: {
        enableHealthChecks: process.env.ENABLE_HEALTH_CHECKS !== 'false',
        enableMetrics: process.env.ENABLE_METRICS !== 'false',
        enableLogging: process.env.ENABLE_LOGGING !== 'false',
        logLevel: process.env.LOG_LEVEL || 'info'
    },

    // Security Configuration
    security: {
        corsOrigin: process.env.CORS_ORIGIN || '*',
        secureHeaders: process.env.SECURE_HEADERS !== 'false',
        rateLimiting: process.env.RATE_LIMITING !== 'false'
    },

    // Performance Configuration
    performance: {
        maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb',
        requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
        keepAliveTimeout: parseInt(process.env.KEEP_ALIVE_TIMEOUT) || 5000
    },

    // Monitoring Configuration
    monitoring: {
        enableMonitoring: process.env.ENABLE_MONITORING !== 'false',
        metricsPort: parseInt(process.env.METRICS_PORT) || 9090,
        healthCheckInterval: process.env.HEALTH_CHECK_INTERVAL || '30s'
    },

    // Crew Configuration
    crew: {
        totalMembers: parseInt(process.env.CREW_MEMBERS) || 9,
        validationEnabled: process.env.CREW_VALIDATION_ENABLED !== 'false',
        analysisEnabled: process.env.CREW_ANALYSIS_ENABLED !== 'false'
    },

    // Dashboard Features
    dashboard: {
        autoRefresh: process.env.DASHBOARD_AUTO_REFRESH !== 'false',
        refreshInterval: parseInt(process.env.DASHBOARD_REFRESH_INTERVAL) || 3000,
        websiteAutoRefresh: process.env.WEBSITE_AUTO_REFRESH !== 'false',
        websiteRefreshInterval: parseInt(process.env.WEBSITE_REFRESH_INTERVAL) || 5000
    },

    // Production URLs
    urls: {
        web: process.env.WEB_URL || 'http://localhost:3000',
        dashboard: process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard',
        api: process.env.API_URL || 'http://localhost:3000/api'
    },

    // Platform-specific configurations
    platforms: {
        vercel: {
            maxDuration: 30,
            memory: '1024mb',
            regions: ['iad1']
        },
        docker: {
            healthcheck: {
                test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health'],
                interval: '30s',
                timeout: '10s',
                retries: 3
            }
        },
        aws: {
            lambda: {
                timeout: 30,
                memory: 512,
                runtime: 'nodejs20.x'
            }
        }
    }
};




