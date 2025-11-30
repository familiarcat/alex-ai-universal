/**
 * File System Guard
 *
 * Provides security and safety measures for file system operations
 */
export interface FileSystemGuardConfig {
    allowedPaths: string[];
    blockedPaths: string[];
    maxFileSize: number;
    allowedExtensions: string[];
    blockedExtensions: string[];
}
export declare class FileSystemGuard {
    private config;
    constructor(config?: Partial<FileSystemGuardConfig>);
    /**
     * Check if a file path is allowed
     */
    isPathAllowed(filePath: string): boolean;
    /**
     * Check if a file extension is allowed
     */
    isExtensionAllowed(filePath: string): boolean;
    /**
     * Check if file size is within limits
     */
    isFileSizeAllowed(fileSize: number): boolean;
    /**
     * Validate a file operation
     */
    validateFileOperation(filePath: string, fileSize?: number): {
        allowed: boolean;
        reason?: string;
    };
    /**
     * Get file extension from path
     */
    private getFileExtension;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<FileSystemGuardConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): FileSystemGuardConfig;
}
//# sourceMappingURL=file-system-guard.d.ts.map