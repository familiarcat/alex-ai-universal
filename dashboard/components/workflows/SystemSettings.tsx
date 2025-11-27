'use client';

/**
 * System Settings Component
 * 
 * Comprehensive settings dashboard for MCP system configuration
 */

import React, { useState, useEffect } from 'react';

interface Settings {
  mcp: {
    serverUrl: string;
    apiKey: string;
    enabled: boolean;
  };
  openRouter: {
    apiKey: string;
    defaultModel: string;
    costOptimization: boolean;
  };
  crew: {
    defaultCrew: string[];
    autoSelect: boolean;
  };
  notifications: {
    email: boolean;
    errors: boolean;
    executions: boolean;
  };
  theme: {
    current: string;
    customColors: Record<string, string>;
  };
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<Settings>({
    mcp: {
      serverUrl: process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://mcp.pbradygeorgen.com',
      apiKey: '',
      enabled: true
    },
    openRouter: {
      apiKey: '',
      defaultModel: 'anthropic/claude-3.5-sonnet',
      costOptimization: true
    },
    crew: {
      defaultCrew: [],
      autoSelect: true
    },
    notifications: {
      email: false,
      errors: true,
      executions: false
    },
    theme: {
      current: 'default',
      customColors: {}
    }
  });

  const [saving, setSaving] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/mcp/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/mcp/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (service: 'mcp' | 'openRouter') => {
    try {
      const response = await fetch(`/api/mcp/settings/test?service=${service}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      const result = await response.json();
      setTestResults({ ...testResults, [service]: result.success });
      
      if (result.success) {
        alert(`${service.toUpperCase()} connection successful!`);
      } else {
        alert(`${service.toUpperCase()} connection failed: ${result.error}`);
      }
    } catch (error) {
      setTestResults({ ...testResults, [service]: false });
      alert(`Error testing ${service} connection`);
    }
  };

  return (
    <div style={{
      padding: 'var(--spacing-lg)',
      background: 'var(--card)',
      borderRadius: 'var(--radius)',
      border: 'var(--border)',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h2 style={{
        fontSize: 'var(--font-xl)',
        color: 'var(--accent)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        ⚙️ System Settings
      </h2>

      {/* MCP Server Settings */}
      <section style={{
        marginBottom: 'var(--spacing-lg)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-sm)',
        border: 'var(--border)',
        background: 'var(--background)'
      }}>
        <h3 style={{
          fontSize: 'var(--font-lg)',
          color: 'var(--text)',
          marginBottom: 'var(--spacing-md)'
        }}>
          MCP Server Configuration
        </h3>
        
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
            Server URL
          </label>
          <input
            type="text"
            value={settings.mcp.serverUrl}
            onChange={(e) => setSettings({
              ...settings,
              mcp: { ...settings.mcp, serverUrl: e.target.value }
            })}
            style={{
              width: '100%',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border)',
              background: 'var(--card)',
              color: 'var(--text)'
            }}
          />
        </div>

        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
            API Key
          </label>
          <input
            type="password"
            value={settings.mcp.apiKey}
            onChange={(e) => setSettings({
              ...settings,
              mcp: { ...settings.mcp, apiKey: e.target.value }
            })}
            placeholder="Enter MCP API key"
            style={{
              width: '100%',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border)',
              background: 'var(--card)',
              color: 'var(--text)'
            }}
          />
        </div>

        <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <input
            type="checkbox"
            checked={settings.mcp.enabled}
            onChange={(e) => setSettings({
              ...settings,
              mcp: { ...settings.mcp, enabled: e.target.checked }
            })}
          />
          <label>Enable MCP Server</label>
        </div>

        <button
          onClick={() => testConnection('mcp')}
          style={{
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border)',
            background: testResults.mcp ? 'var(--status-success)' : 'var(--accent)',
            color: 'white',
            cursor: 'pointer',
            fontSize: 'var(--font-sm)'
          }}
        >
          {testResults.mcp ? '✅ Connected' : 'Test Connection'}
        </button>
      </section>

      {/* OpenRouter Settings */}
      <section style={{
        marginBottom: 'var(--spacing-lg)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-sm)',
        border: 'var(--border)',
        background: 'var(--background)'
      }}>
        <h3 style={{
          fontSize: 'var(--font-lg)',
          color: 'var(--text)',
          marginBottom: 'var(--spacing-md)'
        }}>
          OpenRouter Configuration
        </h3>

        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
            API Key
          </label>
          <input
            type="password"
            value={settings.openRouter.apiKey}
            onChange={(e) => setSettings({
              ...settings,
              openRouter: { ...settings.openRouter, apiKey: e.target.value }
            })}
            placeholder="Enter OpenRouter API key"
            style={{
              width: '100%',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border)',
              background: 'var(--card)',
              color: 'var(--text)'
            }}
          />
        </div>

        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
            Default Model
          </label>
          <select
            value={settings.openRouter.defaultModel}
            onChange={(e) => setSettings({
              ...settings,
              openRouter: { ...settings.openRouter, defaultModel: e.target.value }
            })}
            style={{
              width: '100%',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border)',
              background: 'var(--card)',
              color: 'var(--text)'
            }}
          >
            <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="openai/gpt-4o">GPT-4o</option>
            <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
            <option value="google/gemini-pro-1.5">Gemini Pro 1.5</option>
            <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B</option>
          </select>
        </div>

        <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <input
            type="checkbox"
            checked={settings.openRouter.costOptimization}
            onChange={(e) => setSettings({
              ...settings,
              openRouter: { ...settings.openRouter, costOptimization: e.target.checked }
            })}
          />
          <label>Enable Cost Optimization</label>
        </div>

        <button
          onClick={() => testConnection('openRouter')}
          style={{
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border)',
            background: testResults.openRouter ? 'var(--status-success)' : 'var(--accent)',
            color: 'white',
            cursor: 'pointer',
            fontSize: 'var(--font-sm)'
          }}
        >
          {testResults.openRouter ? '✅ Connected' : 'Test Connection'}
        </button>
      </section>

      {/* Crew Preferences */}
      <section style={{
        marginBottom: 'var(--spacing-lg)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-sm)',
        border: 'var(--border)',
        background: 'var(--background)'
      }}>
        <h3 style={{
          fontSize: 'var(--font-lg)',
          color: 'var(--text)',
          marginBottom: 'var(--spacing-md)'
        }}>
          Crew Preferences
        </h3>

        <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <input
            type="checkbox"
            checked={settings.crew.autoSelect}
            onChange={(e) => setSettings({
              ...settings,
              crew: { ...settings.crew, autoSelect: e.target.checked }
            })}
          />
          <label>Auto-select relevant crew members</label>
        </div>
      </section>

      {/* Notifications */}
      <section style={{
        marginBottom: 'var(--spacing-lg)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-sm)',
        border: 'var(--border)',
        background: 'var(--background)'
      }}>
        <h3 style={{
          fontSize: 'var(--font-lg)',
          color: 'var(--text)',
          marginBottom: 'var(--spacing-md)'
        }}>
          Notifications
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <input
              type="checkbox"
              checked={settings.notifications.errors}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, errors: e.target.checked }
              })}
            />
            Notify on errors
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <input
              type="checkbox"
              checked={settings.notifications.executions}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, executions: e.target.checked }
              })}
            />
            Notify on workflow execution
          </label>
        </div>
      </section>

      {/* Save Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 'var(--spacing-sm)',
        marginTop: 'var(--spacing-lg)'
      }}>
        <button
          onClick={loadSettings}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border)',
            background: 'var(--background)',
            color: 'var(--text)',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
        <button
          onClick={saveSettings}
          disabled={saving}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'var(--accent)',
            color: 'var(--text-on-accent)',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

