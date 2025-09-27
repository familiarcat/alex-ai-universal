/**
 * NPX Package Integration
 * Handles installation, initialization, and setup of Alex AI via npx
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

export interface NPXInstallationConfig {
  packageName: string;
  version?: string;
  global: boolean;
  installationPath: string;
  configPath: string;
  credentialsPath: string;
}

export interface AlexAIConfig {
  sessionId: string;
  n8nUrl: string;
  n8nApiKey: string;
  supabaseUrl: string;
  supabaseKey: string;
  openaiApiKey: string;
  installationDate: Date;
  lastUpdate?: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  autoConnect: boolean;
  crewMembers: string[];
  memoryRetention: 'short' | 'medium' | 'long';
  notificationLevel: 'minimal' | 'normal' | 'verbose';
  theme: 'light' | 'dark' | 'auto';
}

export class NPXIntegration {
  private config: NPXInstallationConfig;
  private alexConfig: AlexAIConfig | null = null;

  constructor() {
    this.config = {
      packageName: '@alex-ai/cli',
      global: true,
      installationPath: path.join(os.homedir(), '.alex-ai'),
      configPath: path.join(os.homedir(), '.alex-ai', 'config.json'),
      credentialsPath: path.join(os.homedir(), '.alex-ai', 'credentials.json')
    };
  }

  /**
   * Install Alex AI package via npx
   */
  async installPackage(version?: string): Promise<void> {
    console.log('🚀 Installing Alex AI via NPX...');
    console.log('=================================');

    try {
      // Check if npx is available
      this.checkNPXAvailability();

      // Install package
      const packageSpec = version ? `${this.config.packageName}@${version}` : this.config.packageName;
      console.log(`📦 Installing ${packageSpec}...`);
      
      const installCommand = this.config.global 
        ? `npm install -g ${packageSpec}`
        : `npx ${packageSpec} --install`;

      execSync(installCommand, { stdio: 'inherit' });

      // Create installation directory
      await this.createInstallationDirectory();

      // Initialize configuration
      await this.initializeConfiguration();

      console.log('✅ Alex AI installed successfully!');
      console.log('🔧 Configuration initialized');
      console.log('📁 Installation directory created');

    } catch (error) {
      console.error('❌ Installation failed:', error);
      throw error;
    }
  }

  /**
   * Initialize Alex AI configuration
   */
  async initializeConfiguration(): Promise<void> {
    console.log('🔧 Initializing Alex AI configuration...');

    const defaultConfig: AlexAIConfig = {
      sessionId: this.generateSessionId(),
      n8nUrl: '',
      n8nApiKey: '',
      supabaseUrl: '',
      supabaseKey: '',
      openaiApiKey: '',
      installationDate: new Date(),
      preferences: {
        autoConnect: true,
        crewMembers: [
          'captain_picard', 'commander_data', 'geordi_la_forge', 'lieutenant_worf',
          'counselor_troi', 'commander_riker', 'dr_crusher', 'la_forge', 'spock'
        ],
        memoryRetention: 'medium',
        notificationLevel: 'normal',
        theme: 'auto'
      }
    };

    // Try to load existing credentials from environment
    await this.loadCredentialsFromEnvironment(defaultConfig);

    // Save configuration
    await this.saveConfiguration(defaultConfig);
    this.alexConfig = defaultConfig;

    console.log('✅ Configuration initialized');
    console.log(`📁 Config saved to: ${this.config.configPath}`);
  }

  /**
   * Load credentials from environment variables
   */
  private async loadCredentialsFromEnvironment(config: AlexAIConfig): Promise<void> {
    console.log('🔐 Loading credentials from environment...');

    const envVars = {
      n8nUrl: process.env.N8N_URL,
      n8nApiKey: process.env.N8N_API_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY
    };

    let credentialsFound = 0;
    Object.entries(envVars).forEach(([key, value]) => {
      if (value) {
        (config as any)[key] = value;
        credentialsFound++;
      }
    });

    if (credentialsFound > 0) {
      console.log(`✅ Found ${credentialsFound} credentials in environment`);
    } else {
      console.log('⚠️  No credentials found in environment');
      console.log('💡 You can configure them later with: alex-ai configure');
    }
  }

  /**
   * Create installation directory structure
   */
  private async createInstallationDirectory(): Promise<void> {
    console.log('📁 Creating installation directory...');

    const directories = [
      this.config.installationPath,
      path.join(this.config.installationPath, 'sessions'),
      path.join(this.config.installationPath, 'temp'),
      path.join(this.config.installationPath, 'logs'),
      path.join(this.config.installationPath, 'workflows'),
      path.join(this.config.installationPath, 'memories')
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`   ✅ Created: ${dir}`);
      } catch (error) {
        console.warn(`   ⚠️  Directory exists: ${dir}`);
      }
    }
  }

  /**
   * Save configuration to file
   */
  private async saveConfiguration(config: AlexAIConfig): Promise<void> {
    await fs.writeFile(
      this.config.configPath,
      JSON.stringify(config, null, 2),
      'utf8'
    );
  }

  /**
   * Load configuration from file
   */
  async loadConfiguration(): Promise<AlexAIConfig | null> {
    try {
      const configData = await fs.readFile(this.config.configPath, 'utf8');
      this.alexConfig = JSON.parse(configData);
      return this.alexConfig;
    } catch (error) {
      console.warn('⚠️  Could not load configuration:', error);
      return null;
    }
  }

  /**
   * Configure Alex AI with user credentials
   */
  async configureCredentials(credentials: Partial<AlexAIConfig>): Promise<void> {
    console.log('🔐 Configuring Alex AI credentials...');

    if (!this.alexConfig) {
      await this.loadConfiguration();
    }

    if (!this.alexConfig) {
      throw new Error('No configuration found. Please run initialization first.');
    }

    // Update configuration with new credentials
    Object.assign(this.alexConfig, credentials);
    this.alexConfig.lastUpdate = new Date();

    // Save updated configuration
    await this.saveConfiguration(this.alexConfig);

    console.log('✅ Credentials configured successfully');
  }

  /**
   * Verify installation and configuration
   */
  async verifyInstallation(): Promise<boolean> {
    console.log('🔍 Verifying Alex AI installation...');

    try {
      // Check if package is installed
      const packageCheck = this.checkPackageInstallation();
      if (!packageCheck) {
        console.log('❌ Package not installed');
        return false;
      }

      // Check configuration
      const configExists = await this.checkConfigurationExists();
      if (!configExists) {
        console.log('❌ Configuration not found');
        return false;
      }

      // Check directories
      const directoriesExist = await this.checkDirectoriesExist();
      if (!directoriesExist) {
        console.log('❌ Installation directories missing');
        return false;
      }

      // Load and validate configuration
      const config = await this.loadConfiguration();
      if (!config) {
        console.log('❌ Configuration invalid');
        return false;
      }

      console.log('✅ Installation verified successfully');
      return true;

    } catch (error) {
      console.error('❌ Installation verification failed:', error);
      return false;
    }
  }

  /**
   * Get installation status
   */
  async getInstallationStatus(): Promise<{
    installed: boolean;
    configured: boolean;
    ready: boolean;
    details: string;
  }> {
    const installed = this.checkPackageInstallation();
    const configured = await this.checkConfigurationExists();
    const ready = installed && configured;

    let details = '';
    if (!installed) details += 'Package not installed. ';
    if (!configured) details += 'Configuration missing. ';
    if (ready) details = 'Alex AI is ready to use!';

    return { installed, configured, ready, details };
  }

  /**
   * Uninstall Alex AI
   */
  async uninstall(): Promise<void> {
    console.log('🗑️  Uninstalling Alex AI...');

    try {
      // Remove global package
      if (this.config.global) {
        execSync(`npm uninstall -g ${this.config.packageName}`, { stdio: 'inherit' });
      }

      // Remove installation directory
      await fs.rmdir(this.config.installationPath, { recursive: true });

      console.log('✅ Alex AI uninstalled successfully');

    } catch (error) {
      console.error('❌ Uninstallation failed:', error);
      throw error;
    }
  }

  // Helper methods
  private checkNPXAvailability(): void {
    try {
      execSync('npx --version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('npx is not available. Please install Node.js and npm.');
    }
  }

  private checkPackageInstallation(): boolean {
    try {
      execSync(`${this.config.packageName} --version`, { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  private async checkConfigurationExists(): Promise<boolean> {
    try {
      await fs.access(this.config.configPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async checkDirectoriesExist(): Promise<boolean> {
    try {
      await fs.access(this.config.installationPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  private generateSessionId(): string {
    return `alex-ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Getters
  getConfig(): NPXInstallationConfig {
    return { ...this.config };
  }

  getAlexConfig(): AlexAIConfig | null {
    return this.alexConfig ? { ...this.alexConfig } : null;
  }

  getInstallationPath(): string {
    return this.config.installationPath;
  }
}
