/**
 * Enterprise Security System - DOD/Fortune 500 Compliant Security
 *
 * Implements air-tight security like a submarine with complete data classification,
 * access controls, encryption, and monitoring for enterprise environments
 */
import { EventEmitter } from 'events';
export declare enum DataClassification {
    OPEN = "open",
    CONFIDENTIAL = "confidential",
    SECRET = "secret",
    TOP_SECRET = "top_secret"
}
export declare enum UserRole {
    GUEST = "guest",
    USER = "user",
    DEVELOPER = "developer",
    ADMIN = "admin",
    SECURITY_OFFICER = "security_officer",
    SYSTEM_ADMIN = "system_admin"
}
export declare enum SecurityEventType {
    DATA_ACCESS = "data_access",
    DATA_MODIFICATION = "data_modification",
    AUTHENTICATION = "authentication",
    AUTHORIZATION = "authorization",
    ENCRYPTION = "encryption",
    DECRYPTION = "decryption",
    CLASSIFICATION_CHANGE = "classification_change",
    SECURITY_VIOLATION = "security_violation",
    SYSTEM_ERROR = "system_error"
}
export interface SecurityEvent {
    id: string;
    type: SecurityEventType;
    userId: string;
    userRole: UserRole;
    dataClassification: DataClassification;
    timestamp: Date;
    details: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    ipAddress?: string;
    userAgent?: string;
    resource?: string;
    action?: string;
    result: 'success' | 'failure' | 'blocked';
    metadata?: any;
}
export interface AccessControlPolicy {
    id: string;
    name: string;
    userRole: UserRole;
    dataClassification: DataClassification;
    permissions: Permission[];
    conditions?: AccessCondition[];
    expiresAt?: Date;
}
export interface Permission {
    resource: string;
    actions: string[];
    conditions?: string[];
}
export interface AccessCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
    value: any;
}
export interface DataLossPreventionRule {
    id: string;
    name: string;
    pattern: RegExp;
    classification: DataClassification;
    action: 'block' | 'warn' | 'encrypt' | 'audit';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
}
export interface EncryptionKey {
    id: string;
    classification: DataClassification;
    key: Buffer;
    algorithm: string;
    createdAt: Date;
    expiresAt: Date;
    version: number;
    isActive: boolean;
}
export interface SecureData {
    id: string;
    content: string;
    classification: DataClassification;
    encryptedContent: string;
    encryptionKeyId: string;
    checksum: string;
    createdAt: Date;
    lastAccessed: Date;
    accessCount: number;
    createdBy: string;
    metadata: any;
}
export declare class EnterpriseSecuritySystem extends EventEmitter {
    private accessControlPolicies;
    private dlpRules;
    private encryptionKeys;
    private securityEvents;
    private secureData;
    private activeSessions;
    private blockedIPs;
    private rateLimits;
    constructor();
    /**
     * Initialize the enterprise security system
     */
    private initializeSecuritySystem;
    /**
     * Initialize encryption keys for each data classification
     */
    private initializeEncryptionKeys;
    /**
     * Generate encryption key for data classification
     */
    private generateEncryptionKey;
    /**
     * Initialize Data Loss Prevention rules
     */
    private initializeDLPRules;
    /**
     * Initialize access control policies
     */
    private initializeAccessControlPolicies;
    /**
     * Classify content based on DLP rules
     */
    classifyContent(content: string): Promise<{
        classification: DataClassification;
        matchedRules: DataLossPreventionRule[];
        confidence: number;
    }>;
    /**
     * Get classification level for comparison
     */
    private getClassificationLevel;
    /**
     * Check if user has access to data classification
     */
    checkAccess(userId: string, userRole: UserRole, dataClassification: DataClassification, resource: string, action: string): Promise<{
        allowed: boolean;
        reason?: string;
    }>;
    /**
     * Encrypt data with appropriate classification
     */
    encryptData(data: string, classification: DataClassification, userId: string): Promise<{
        encryptedData: string;
        keyId: string;
        checksum: string;
    }>;
    /**
     * Decrypt data with access control
     */
    decryptData(encryptedData: string, keyId: string, userId: string, userRole: UserRole): Promise<{
        decryptedData: string;
        classification: DataClassification;
    }>;
    /**
     * Process secure chat with full security controls
     */
    processSecureChat(message: string, userId: string, userRole: UserRole, context?: any): Promise<{
        response: string;
        classification: DataClassification;
        securityLevel: string;
        auditId: string;
    }>;
    /**
     * Apply Data Loss Prevention rules
     */
    private applyDLPRules;
    /**
     * Process with appropriate security level
     */
    private processWithSecurityLevel;
    /**
     * Get security level description
     */
    private getSecurityLevel;
    /**
     * Log security event
     */
    private logSecurityEvent;
    /**
     * Start security monitoring
     */
    private startSecurityMonitoring;
    /**
     * Get security audit report
     */
    getSecurityAuditReport(): {
        totalEvents: number;
        violations: number;
        criticalEvents: number;
        blockedAccess: number;
        recentEvents: SecurityEvent[];
        securityScore: number;
    };
    /**
     * Get system security status
     */
    getSecurityStatus(): {
        isSecure: boolean;
        encryptionKeys: number;
        dlpRules: number;
        accessPolicies: number;
        activeSessions: number;
        blockedIPs: number;
        lastSecurityEvent?: Date;
    };
}
//# sourceMappingURL=enterprise-security-system.d.ts.map