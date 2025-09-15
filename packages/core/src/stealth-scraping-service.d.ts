/**
 * Stealth Scraping Service - IP-Protected Web Scraping
 *
 * This service provides stealth web scraping capabilities with IP protection
 * and anti-detection measures for all sub-projects in the monorepo.
 */
export interface StealthConfig {
    enableUserAgentRotation: boolean;
    enableViewportRandomization: boolean;
    enableResourceBlocking: boolean;
    enableAntiDetection: boolean;
    timeout: number;
    retryAttempts: number;
}
export interface ScrapingJob {
    id: string;
    source: string;
    searchTerm: string;
    location: string;
    maxResults: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    results: any[];
    startedAt: Date;
    completedAt?: Date;
    error?: string;
}
export declare class StealthScrapingService {
    private config;
    private activeJobs;
    private userAgents;
    constructor(config?: Partial<StealthConfig>);
    /**
     * Initialize the stealth scraping service
     */
    initialize(): Promise<void>;
    /**
     * Start a stealth scraping job
     */
    startScrapingJob(params: {
        source: string;
        searchTerm: string;
        location: string;
        maxResults: number;
    }): Promise<ScrapingJob>;
    /**
     * Perform the actual scraping
     */
    private performScraping;
    /**
     * Scrape with Puppeteer
     */
    private scrapeWithPuppeteer;
    /**
     * Apply stealth measures to the page
     */
    private applyStealthMeasures;
    /**
     * Get scraping URL based on source
     */
    private getScrapingUrl;
    /**
     * Extract job data from the page
     */
    private extractJobData;
    /**
     * Scrape with mock data (fallback)
     */
    private scrapeWithMock;
    /**
     * Get job status
     */
    getJobStatus(jobId: string): ScrapingJob | null;
    /**
     * Get all active jobs
     */
    getAllJobs(): ScrapingJob[];
    /**
     * Test connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Cleanup
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=stealth-scraping-service.d.ts.map