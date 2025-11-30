"use strict";
/**
 * File System Guard
 *
 * Provides security and safety measures for file system operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemGuard = void 0;
class FileSystemGuard {
    constructor(config) {
        this.config = {
            allowedPaths: config?.allowedPaths || [],
            blockedPaths: config?.blockedPaths || [],
            maxFileSize: config?.maxFileSize || 10 * 1024 * 1024, // 10MB
            allowedExtensions: config?.allowedExtensions || ['.ts', '.js', '.json', '.md'],
            blockedExtensions: config?.blockedExtensions || ['.exe', '.bat', '.sh']
        };
    }
    /**
     * Check if a file path is allowed
     */
    isPathAllowed(filePath) {
        // Check blocked paths first
        for (const blockedPath of this.config.blockedPaths) {
            if (filePath.includes(blockedPath)) {
                return false;
            }
        }
        // Check allowed paths
        if (this.config.allowedPaths.length > 0) {
            return this.config.allowedPaths.some(allowedPath => filePath.includes(allowedPath));
        }
        return true;
    }
    /**
     * Check if a file extension is allowed
     */
    isExtensionAllowed(filePath) {
        const extension = this.getFileExtension(filePath);
        // Check blocked extensions
        if (this.config.blockedExtensions.includes(extension)) {
            return false;
        }
        // Check allowed extensions
        if (this.config.allowedExtensions.length > 0) {
            return this.config.allowedExtensions.includes(extension);
        }
        return true;
    }
    /**
     * Check if file size is within limits
     */
    isFileSizeAllowed(fileSize) {
        return fileSize <= this.config.maxFileSize;
    }
    /**
     * Validate a file operation
     */
    validateFileOperation(filePath, fileSize) {
        if (!this.isPathAllowed(filePath)) {
            return {
                allowed: false,
                reason: 'File path is blocked'
            };
        }
        if (!this.isExtensionAllowed(filePath)) {
            return {
                allowed: false,
                reason: 'File extension is not allowed'
            };
        }
        if (fileSize && !this.isFileSizeAllowed(fileSize)) {
            return {
                allowed: false,
                reason: 'File size exceeds maximum allowed size'
            };
        }
        return { allowed: true };
    }
    /**
     * Get file extension from path
     */
    getFileExtension(filePath) {
        const lastDot = filePath.lastIndexOf('.');
        if (lastDot === -1)
            return '';
        return filePath.substring(lastDot).toLowerCase();
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
}
exports.FileSystemGuard = FileSystemGuard;
//# sourceMappingURL=file-system-guard.js.map