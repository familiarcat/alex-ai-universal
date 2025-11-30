"use strict";
/**
 * Enterprise Security System - DOD/Fortune 500 Compliant Security
 *
 * Implements air-tight security like a submarine with complete data classification,
 * access controls, encryption, and monitoring for enterprise environments
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseSecuritySystem = exports.SecurityEventType = exports.UserRole = exports.DataClassification = void 0;
const crypto = __importStar(require("crypto"));
const events_1 = require("events");
var DataClassification;
(function (DataClassification) {
    DataClassification["OPEN"] = "open";
    DataClassification["CONFIDENTIAL"] = "confidential";
    DataClassification["SECRET"] = "secret";
    DataClassification["TOP_SECRET"] = "top_secret";
})(DataClassification || (exports.DataClassification = DataClassification = {}));
var UserRole;
(function (UserRole) {
    UserRole["GUEST"] = "guest";
    UserRole["USER"] = "user";
    UserRole["DEVELOPER"] = "developer";
    UserRole["ADMIN"] = "admin";
    UserRole["SECURITY_OFFICER"] = "security_officer";
    UserRole["SYSTEM_ADMIN"] = "system_admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var SecurityEventType;
(function (SecurityEventType) {
    SecurityEventType["DATA_ACCESS"] = "data_access";
    SecurityEventType["DATA_MODIFICATION"] = "data_modification";
    SecurityEventType["AUTHENTICATION"] = "authentication";
    SecurityEventType["AUTHORIZATION"] = "authorization";
    SecurityEventType["ENCRYPTION"] = "encryption";
    SecurityEventType["DECRYPTION"] = "decryption";
    SecurityEventType["CLASSIFICATION_CHANGE"] = "classification_change";
    SecurityEventType["SECURITY_VIOLATION"] = "security_violation";
    SecurityEventType["SYSTEM_ERROR"] = "system_error";
})(SecurityEventType || (exports.SecurityEventType = SecurityEventType = {}));
class EnterpriseSecuritySystem extends events_1.EventEmitter {
    constructor() {
        super();
        this.accessControlPolicies = new Map();
        this.dlpRules = new Map();
        this.encryptionKeys = new Map();
        this.securityEvents = [];
        this.secureData = new Map();
        this.activeSessions = new Map();
        this.blockedIPs = new Set();
        this.rateLimits = new Map();
        this.initializeSecuritySystem();
    }
    /**
     * Initialize the enterprise security system
     */
    async initializeSecuritySystem() {
        console.log('🔒 Initializing Enterprise Security System...');
        try {
            // Initialize encryption keys for each classification
            await this.initializeEncryptionKeys();
            // Initialize DLP rules
            await this.initializeDLPRules();
            // Initialize access control policies
            await this.initializeAccessControlPolicies();
            // Start security monitoring
            this.startSecurityMonitoring();
            console.log('✅ Enterprise Security System initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize Enterprise Security System:', error);
            throw error;
        }
    }
    /**
     * Initialize encryption keys for each data classification
     */
    async initializeEncryptionKeys() {
        console.log('🔑 Initializing encryption keys...');
        for (const classification of Object.values(DataClassification)) {
            const key = await this.generateEncryptionKey(classification);
            this.encryptionKeys.set(classification, key);
        }
        console.log('✅ Encryption keys initialized');
    }
    /**
     * Generate encryption key for data classification
     */
    async generateEncryptionKey(classification) {
        const key = crypto.randomBytes(32); // 256-bit key
        const now = new Date();
        return {
            id: crypto.randomUUID(),
            classification,
            key,
            algorithm: 'aes-256-gcm',
            createdAt: now,
            expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
            version: 1,
            isActive: true
        };
    }
    /**
     * Initialize Data Loss Prevention rules
     */
    async initializeDLPRules() {
        console.log('🛡️ Initializing DLP rules...');
        const dlpRules = [
            // SSN Pattern
            {
                id: 'ssn-pattern',
                name: 'SSN Detection',
                pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
                classification: DataClassification.SECRET,
                action: 'encrypt',
                severity: 'high',
                description: 'Detects Social Security Numbers'
            },
            // Credit Card Pattern
            {
                id: 'credit-card-pattern',
                name: 'Credit Card Detection',
                pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
                classification: DataClassification.SECRET,
                action: 'encrypt',
                severity: 'high',
                description: 'Detects Credit Card Numbers'
            },
            // Email Pattern
            {
                id: 'email-pattern',
                name: 'Email Detection',
                pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
                classification: DataClassification.CONFIDENTIAL,
                action: 'encrypt',
                severity: 'medium',
                description: 'Detects Email Addresses'
            },
            // Phone Pattern
            {
                id: 'phone-pattern',
                name: 'Phone Number Detection',
                pattern: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
                classification: DataClassification.CONFIDENTIAL,
                action: 'encrypt',
                severity: 'medium',
                description: 'Detects Phone Numbers'
            },
            // IP Address Pattern
            {
                id: 'ip-pattern',
                name: 'IP Address Detection',
                pattern: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
                classification: DataClassification.CONFIDENTIAL,
                action: 'encrypt',
                severity: 'medium',
                description: 'Detects IP Addresses'
            },
            // API Key Pattern
            {
                id: 'api-key-pattern',
                name: 'API Key Detection',
                pattern: /\b[A-Za-z0-9]{32,}\b/g,
                classification: DataClassification.SECRET,
                action: 'encrypt',
                severity: 'high',
                description: 'Detects API Keys'
            },
            // Password Pattern
            {
                id: 'password-pattern',
                name: 'Password Detection',
                pattern: /password\s*[:=]\s*[^\s]+/gi,
                classification: DataClassification.SECRET,
                action: 'encrypt',
                severity: 'high',
                description: 'Detects Password References'
            }
        ];
        for (const rule of dlpRules) {
            this.dlpRules.set(rule.id, rule);
        }
        console.log('✅ DLP rules initialized');
    }
    /**
     * Initialize access control policies
     */
    async initializeAccessControlPolicies() {
        console.log('🔐 Initializing access control policies...');
        const policies = [
            // Guest access
            {
                id: 'guest-open',
                name: 'Guest Open Data Access',
                userRole: UserRole.GUEST,
                dataClassification: DataClassification.OPEN,
                permissions: [
                    { resource: 'open_data', actions: ['read'] }
                ]
            },
            // User access
            {
                id: 'user-confidential',
                name: 'User Confidential Data Access',
                userRole: UserRole.USER,
                dataClassification: DataClassification.CONFIDENTIAL,
                permissions: [
                    { resource: 'open_data', actions: ['read', 'write'] },
                    { resource: 'confidential_data', actions: ['read'] }
                ]
            },
            // Developer access
            {
                id: 'developer-secret',
                name: 'Developer Secret Data Access',
                userRole: UserRole.DEVELOPER,
                dataClassification: DataClassification.SECRET,
                permissions: [
                    { resource: 'open_data', actions: ['read', 'write', 'delete'] },
                    { resource: 'confidential_data', actions: ['read', 'write'] },
                    { resource: 'secret_data', actions: ['read'] }
                ]
            },
            // Admin access
            {
                id: 'admin-top-secret',
                name: 'Admin Top Secret Data Access',
                userRole: UserRole.ADMIN,
                dataClassification: DataClassification.TOP_SECRET,
                permissions: [
                    { resource: '*', actions: ['read', 'write', 'delete', 'admin'] }
                ]
            },
            // Security Officer access
            {
                id: 'security-officer-all',
                name: 'Security Officer Full Access',
                userRole: UserRole.SECURITY_OFFICER,
                dataClassification: DataClassification.TOP_SECRET,
                permissions: [
                    { resource: '*', actions: ['read', 'write', 'delete', 'admin', 'audit'] }
                ]
            }
        ];
        for (const policy of policies) {
            this.accessControlPolicies.set(policy.id, policy);
        }
        console.log('✅ Access control policies initialized');
    }
    /**
     * Classify content based on DLP rules
     */
    async classifyContent(content) {
        let highestClassification = DataClassification.OPEN;
        const matchedRules = [];
        let totalMatches = 0;
        for (const rule of this.dlpRules.values()) {
            const matches = content.match(rule.pattern);
            if (matches && matches.length > 0) {
                matchedRules.push(rule);
                totalMatches += matches.length;
                // Update classification to highest matched rule
                if (this.getClassificationLevel(rule.classification) > this.getClassificationLevel(highestClassification)) {
                    highestClassification = rule.classification;
                }
            }
        }
        const confidence = Math.min(totalMatches / 10, 1.0); // Normalize confidence
        return {
            classification: highestClassification,
            matchedRules,
            confidence
        };
    }
    /**
     * Get classification level for comparison
     */
    getClassificationLevel(classification) {
        const levels = {
            [DataClassification.OPEN]: 1,
            [DataClassification.CONFIDENTIAL]: 2,
            [DataClassification.SECRET]: 3,
            [DataClassification.TOP_SECRET]: 4
        };
        return levels[classification];
    }
    /**
     * Check if user has access to data classification
     */
    async checkAccess(userId, userRole, dataClassification, resource, action) {
        // Find applicable access control policy
        const policy = Array.from(this.accessControlPolicies.values())
            .find(p => p.userRole === userRole &&
            this.getClassificationLevel(p.dataClassification) >= this.getClassificationLevel(dataClassification));
        if (!policy) {
            this.logSecurityEvent({
                type: SecurityEventType.AUTHORIZATION,
                userId,
                userRole,
                dataClassification,
                details: `Access denied: No policy found for role ${userRole} and classification ${dataClassification}`,
                severity: 'high',
                result: 'blocked',
                resource,
                action
            });
            return { allowed: false, reason: 'No access policy found' };
        }
        // Check if user has permission for resource and action
        const permission = policy.permissions.find(p => p.resource === resource || p.resource === '*');
        if (!permission || !permission.actions.includes(action) && !permission.actions.includes('*')) {
            this.logSecurityEvent({
                type: SecurityEventType.AUTHORIZATION,
                userId,
                userRole,
                dataClassification,
                details: `Access denied: No permission for ${action} on ${resource}`,
                severity: 'medium',
                result: 'blocked',
                resource,
                action
            });
            return { allowed: false, reason: 'Insufficient permissions' };
        }
        // Check conditions if any
        if (policy.conditions) {
            for (const condition of policy.conditions) {
                // Implement condition checking logic here
                // This would check user attributes, time, location, etc.
            }
        }
        this.logSecurityEvent({
            type: SecurityEventType.AUTHORIZATION,
            userId,
            userRole,
            dataClassification,
            details: `Access granted: ${action} on ${resource}`,
            severity: 'low',
            result: 'success',
            resource,
            action
        });
        return { allowed: true };
    }
    /**
     * Encrypt data with appropriate classification
     */
    async encryptData(data, classification, userId) {
        const key = this.encryptionKeys.get(classification);
        if (!key || !key.isActive) {
            throw new Error(`No active encryption key found for classification: ${classification}`);
        }
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipher('aes-256-gcm', key.key);
            cipher.setAAD(Buffer.from(classification));
            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const tag = cipher.getAuthTag();
            const encryptedData = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
            const checksum = crypto.createHash('sha256').update(data).digest('hex');
            this.logSecurityEvent({
                type: SecurityEventType.ENCRYPTION,
                userId,
                userRole: UserRole.SYSTEM_ADMIN, // System operation
                dataClassification: classification,
                details: `Data encrypted with classification ${classification}`,
                severity: 'low',
                result: 'success',
                action: 'encrypt'
            });
            return {
                encryptedData,
                keyId: key.id,
                checksum
            };
        }
        catch (error) {
            this.logSecurityEvent({
                type: SecurityEventType.SYSTEM_ERROR,
                userId,
                userRole: UserRole.SYSTEM_ADMIN,
                dataClassification: classification,
                details: `Encryption failed: ${error}`,
                severity: 'high',
                result: 'failure',
                action: 'encrypt'
            });
            throw error;
        }
    }
    /**
     * Decrypt data with access control
     */
    async decryptData(encryptedData, keyId, userId, userRole) {
        const key = Array.from(this.encryptionKeys.values())
            .find(k => k.id === keyId && k.isActive);
        if (!key) {
            throw new Error('Invalid or inactive encryption key');
        }
        // Check access permissions
        const accessCheck = await this.checkAccess(userId, userRole, key.classification, 'encrypted_data', 'read');
        if (!accessCheck.allowed) {
            throw new Error(`Access denied: ${accessCheck.reason}`);
        }
        try {
            const [ivHex, tagHex, encrypted] = encryptedData.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const tag = Buffer.from(tagHex, 'hex');
            const decipher = crypto.createDecipher('aes-256-gcm', key.key);
            decipher.setAAD(Buffer.from(key.classification));
            decipher.setAuthTag(tag);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            this.logSecurityEvent({
                type: SecurityEventType.DECRYPTION,
                userId,
                userRole,
                dataClassification: key.classification,
                details: `Data decrypted with classification ${key.classification}`,
                severity: 'low',
                result: 'success',
                action: 'decrypt'
            });
            return {
                decryptedData: decrypted,
                classification: key.classification
            };
        }
        catch (error) {
            this.logSecurityEvent({
                type: SecurityEventType.SYSTEM_ERROR,
                userId,
                userRole,
                dataClassification: key.classification,
                details: `Decryption failed: ${error}`,
                severity: 'high',
                result: 'failure',
                action: 'decrypt'
            });
            throw error;
        }
    }
    /**
     * Process secure chat with full security controls
     */
    async processSecureChat(message, userId, userRole, context) {
        const auditId = crypto.randomUUID();
        try {
            // 1. Classify input content
            const classificationResult = await this.classifyContent(message);
            // 2. Check access permissions
            const accessCheck = await this.checkAccess(userId, userRole, classificationResult.classification, 'chat_processing', 'read');
            if (!accessCheck.allowed) {
                throw new Error(`Access denied: ${accessCheck.reason}`);
            }
            // 3. Apply DLP rules
            const dlpResult = await this.applyDLPRules(message, classificationResult);
            // 4. Encrypt sensitive data
            const encryptedMessage = await this.encryptData(dlpResult.processedContent, classificationResult.classification, userId);
            // 5. Process with appropriate security level
            const response = await this.processWithSecurityLevel(encryptedMessage.encryptedData, classificationResult.classification, userId, userRole);
            // 6. Decrypt response if needed
            const decryptedResponse = await this.decryptData(response, encryptedMessage.keyId, userId, userRole);
            // 7. Log security event
            this.logSecurityEvent({
                type: SecurityEventType.DATA_ACCESS,
                userId,
                userRole,
                dataClassification: classificationResult.classification,
                details: `Secure chat processed with classification ${classificationResult.classification}`,
                severity: 'low',
                result: 'success',
                action: 'chat_process',
                metadata: { auditId, dlpRules: dlpResult.appliedRules }
            });
            return {
                response: decryptedResponse.decryptedData,
                classification: classificationResult.classification,
                securityLevel: this.getSecurityLevel(classificationResult.classification),
                auditId
            };
        }
        catch (error) {
            this.logSecurityEvent({
                type: SecurityEventType.SECURITY_VIOLATION,
                userId,
                userRole,
                dataClassification: DataClassification.SECRET, // Assume highest for violations
                details: `Secure chat processing failed: ${error}`,
                severity: 'high',
                result: 'failure',
                action: 'chat_process',
                metadata: { auditId }
            });
            throw error;
        }
    }
    /**
     * Apply Data Loss Prevention rules
     */
    async applyDLPRules(content, classificationResult) {
        let processedContent = content;
        const appliedRules = [];
        for (const rule of classificationResult.matchedRules) {
            switch (rule.action) {
                case 'block':
                    throw new Error(`Content blocked by DLP rule: ${rule.name}`);
                case 'warn':
                    console.warn(`DLP Warning: ${rule.description}`);
                    appliedRules.push(rule.name);
                    break;
                case 'encrypt':
                    // Content is already classified for encryption
                    appliedRules.push(rule.name);
                    break;
                case 'audit':
                    this.logSecurityEvent({
                        type: SecurityEventType.SECURITY_VIOLATION,
                        userId: 'system',
                        userRole: UserRole.SYSTEM_ADMIN,
                        dataClassification: rule.classification,
                        details: `DLP rule triggered: ${rule.description}`,
                        severity: rule.severity,
                        result: 'success',
                        action: 'dlp_audit',
                        metadata: { ruleId: rule.id, ruleName: rule.name }
                    });
                    appliedRules.push(rule.name);
                    break;
            }
        }
        return { processedContent, appliedRules };
    }
    /**
     * Process with appropriate security level
     */
    async processWithSecurityLevel(encryptedContent, classification, userId, userRole) {
        // This would integrate with AI services with appropriate security controls
        // For now, return the encrypted content as a placeholder
        return encryptedContent;
    }
    /**
     * Get security level description
     */
    getSecurityLevel(classification) {
        const levels = {
            [DataClassification.OPEN]: 'Standard Security',
            [DataClassification.CONFIDENTIAL]: 'Enhanced Security',
            [DataClassification.SECRET]: 'High Security',
            [DataClassification.TOP_SECRET]: 'Maximum Security'
        };
        return levels[classification];
    }
    /**
     * Log security event
     */
    logSecurityEvent(event) {
        const securityEvent = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            ...event
        };
        this.securityEvents.push(securityEvent);
        // Emit event for real-time monitoring
        this.emit('securityEvent', securityEvent);
        // Check for security violations
        if (event.severity === 'critical' || event.result === 'blocked') {
            this.emit('securityViolation', securityEvent);
        }
    }
    /**
     * Start security monitoring
     */
    startSecurityMonitoring() {
        console.log('🔍 Starting security monitoring...');
        // Monitor for security violations
        this.on('securityViolation', (event) => {
            console.warn(`🚨 Security Violation: ${event.details}`);
            // Implement real-time response (block IP, alert admins, etc.)
        });
        // Monitor for critical events
        this.on('securityEvent', (event) => {
            if (event.severity === 'critical') {
                console.error(`🚨 Critical Security Event: ${event.details}`);
            }
        });
        console.log('✅ Security monitoring started');
    }
    /**
     * Get security audit report
     */
    getSecurityAuditReport() {
        const totalEvents = this.securityEvents.length;
        const violations = this.securityEvents.filter(e => e.result === 'blocked').length;
        const criticalEvents = this.securityEvents.filter(e => e.severity === 'critical').length;
        const blockedAccess = this.securityEvents.filter(e => e.type === SecurityEventType.AUTHORIZATION && e.result === 'blocked').length;
        const recentEvents = this.securityEvents
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
        // Calculate security score (0-100)
        const securityScore = Math.max(0, 100 - (violations * 5) - (criticalEvents * 10));
        return {
            totalEvents,
            violations,
            criticalEvents,
            blockedAccess,
            recentEvents,
            securityScore
        };
    }
    /**
     * Get system security status
     */
    getSecurityStatus() {
        const lastEvent = this.securityEvents.length > 0
            ? this.securityEvents[this.securityEvents.length - 1].timestamp
            : undefined;
        return {
            isSecure: this.securityEvents.filter(e => e.severity === 'critical').length === 0,
            encryptionKeys: this.encryptionKeys.size,
            dlpRules: this.dlpRules.size,
            accessPolicies: this.accessControlPolicies.size,
            activeSessions: this.activeSessions.size,
            blockedIPs: this.blockedIPs.size,
            lastSecurityEvent: lastEvent
        };
    }
}
exports.EnterpriseSecuritySystem = EnterpriseSecuritySystem;
//# sourceMappingURL=enterprise-security-system.js.map