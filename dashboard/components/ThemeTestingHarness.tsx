'use client';

/**
 * Theme Testing Harness Component
 * 
 * Comprehensive UI for testing theme persistence and functionality
 * 
 * Crew: Troi (UX Lead) + Data (Analytics) + La Forge (Implementation)
 */

import { useState, useEffect } from 'react';

interface TestResult {
  theme: string;
  timestamp: string;
  tests: {
    themeExists: boolean;
    canStore: boolean;
    canRetrieve: boolean;
    persistence: boolean;
    errors: string[];
  };
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: string;
}

export default function ThemeTestingHarness() {
  const [selectedTheme, setSelectedTheme] = useState('midnight');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [tableStatus, setTableStatus] = useState<any>(null);
  const [themes, setThemes] = useState<string[]>([]);

  useEffect(() => {
    loadThemes();
    verifyTable();
  }, []);

  const loadThemes = async () => {
    try {
      const response = await fetch('/api/theme/test?action=list');
      const data = await response.json();
      if (data.success) {
        setThemes(data.themes);
      }
    } catch (error) {
      console.error('Failed to load themes:', error);
    }
  };

  const verifyTable = async () => {
    try {
      const response = await fetch('/api/theme/test?action=verify-settings');
      const data = await response.json();
      setTableStatus(data);
    } catch (error) {
      console.error('Failed to verify table:', error);
    }
  };

  const testSingleTheme = async (theme: string) => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch(`/api/theme/test?action=test&theme=${theme}`);
      const data = await response.json();
      setTestResult(data.results);
    } catch (error: any) {
      setTestResult({
        theme,
        timestamp: new Date().toISOString(),
        tests: {
          themeExists: true,
          canStore: false,
          canRetrieve: false,
          persistence: false,
          errors: [error.message]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const testAllThemes = async () => {
    setLoading(true);
    setAllResults([]);
    setSummary(null);
    
    try {
      const response = await fetch('/api/theme/test?action=test-all');
      const data = await response.json();
      setAllResults(data.results);
      setSummary(data.summary);
    } catch (error) {
      console.error('Failed to test all themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const testThemeCycle = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/theme/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-cycle' })
      });
      const data = await response.json();
      console.log('Cycle test results:', data);
    } catch (error) {
      console.error('Failed to test cycle:', error);
    } finally {
      setLoading(false);
    }
  };

  const setTheme = async (theme: string) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/theme/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-theme', theme, userId: 'default' })
      });
      const data = await response.json();
      
      if (data.success) {
        // Reload page to see theme change
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to set theme:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '24px',
      background: 'var(--card-bg, rgba(255,255,255,0.03))',
      borderRadius: 'var(--radius, 8px)',
      border: '1px solid var(--border, rgba(255,255,255,0.1))',
      marginBottom: '24px'
    }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--text, #fff)' }}>
        🎨 Theme Testing Harness
      </h2>

      {/* Table Status */}
      {tableStatus && (
        <div style={{
          padding: '12px',
          background: tableStatus.success ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
          borderRadius: 'var(--radius-sm, 4px)',
          marginBottom: '16px',
          border: `1px solid ${tableStatus.success ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.3)'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{tableStatus.success ? '✅' : '❌'}</span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              {tableStatus.success ? 'Table Verified' : 'Table Error'}
            </span>
          </div>
          <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: 'var(--text-secondary, #666)' }}>
            {tableStatus.success ? tableStatus.message : tableStatus.error}
          </p>
          {!tableStatus.success && tableStatus.hint && (
            <p style={{ fontSize: '11px', margin: '4px 0 0 0', color: 'var(--text-secondary, #666)' }}>
              💡 {tableStatus.hint}
            </p>
          )}
        </div>
      )}

      {/* Single Theme Test */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--text, #fff)' }}>
          Test Single Theme
        </h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'var(--background, rgba(255,255,255,0.05))',
              border: '1px solid var(--border, rgba(255,255,255,0.1))',
              borderRadius: 'var(--radius-sm, 4px)',
              color: 'var(--text, #fff)',
              fontSize: '14px'
            }}
          >
            {themes.map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
          <button
            onClick={() => testSingleTheme(selectedTheme)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: 'var(--button-bg, rgba(0,150,255,0.2))',
              border: '1px solid var(--button-border, rgba(0,150,255,0.4))',
              borderRadius: 'var(--radius-sm, 4px)',
              color: 'var(--button-text, #fff)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            {loading ? 'Testing...' : 'Test Theme'}
          </button>
          <button
            onClick={() => setTheme(selectedTheme)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: 'var(--accent, rgba(0,255,170,0.2))',
              border: '1px solid var(--accent, rgba(0,255,170,0.4))',
              borderRadius: 'var(--radius-sm, 4px)',
              color: 'var(--text, #fff)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Apply Theme
          </button>
        </div>

        {testResult && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'var(--background-light, rgba(255,255,255,0.02))',
            borderRadius: 'var(--radius-sm, 4px)',
            border: '1px solid var(--border, rgba(255,255,255,0.1))'
          }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Theme Exists: </span>
                <span>{testResult.tests.themeExists ? '✅' : '❌'}</span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Can Store: </span>
                <span>{testResult.tests.canStore ? '✅' : '❌'}</span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Can Retrieve: </span>
                <span>{testResult.tests.canRetrieve ? '✅' : '❌'}</span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Persistence: </span>
                <span>{testResult.tests.persistence ? '✅' : '❌'}</span>
              </div>
            </div>
            {testResult.tests.errors.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--status-error, #ff4444)' }}>Errors:</p>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '11px', color: 'var(--text-secondary, #666)' }}>
                  {testResult.tests.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test All Themes */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--text, #fff)' }}>
          Test All Themes
        </h3>
        <button
          onClick={testAllThemes}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: 'var(--button-bg, rgba(0,150,255,0.2))',
            border: '1px solid var(--button-border, rgba(0,150,255,0.4))',
            borderRadius: 'var(--radius-sm, 4px)',
            color: 'var(--button-text, #fff)',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          {loading ? 'Testing All Themes...' : 'Test All Themes'}
        </button>

        {summary && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'var(--background-light, rgba(255,255,255,0.02))',
            borderRadius: 'var(--radius-sm, 4px)',
            border: '1px solid var(--border, rgba(255,255,255,0.1))'
          }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Total: </span>
                <span style={{ fontWeight: 600 }}>{summary.total}</span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Passed: </span>
                <span style={{ fontWeight: 600, color: 'var(--status-ready, #00ffaa)' }}>{summary.passed}</span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Failed: </span>
                <span style={{ fontWeight: 600, color: 'var(--status-error, #ff4444)' }}>{summary.failed}</span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Pass Rate: </span>
                <span style={{ fontWeight: 600 }}>{summary.passRate}</span>
              </div>
            </div>
          </div>
        )}

        {allResults.length > 0 && (
          <div style={{ marginTop: '12px', maxHeight: '300px', overflowY: 'auto' }}>
            {allResults.map((result, i) => (
              <div
                key={i}
                style={{
                  padding: '8px',
                  marginBottom: '4px',
                  background: result.tests.persistence ? 'rgba(0,255,0,0.05)' : 'rgba(255,0,0,0.05)',
                  borderRadius: 'var(--radius-sm, 4px)',
                  border: `1px solid ${result.tests.persistence ? 'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)'}`,
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{result.theme}</span>
                  <span>{result.tests.persistence ? '✅' : '❌'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

