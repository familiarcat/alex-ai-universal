'use client';

/**
 * About Page
 * Generated from dashboard project: test-project-001
 */

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{
      background: 'var(--theme-background)',
      color: 'var(--theme-text)'
    }}>
      <header className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold">Project test-project-001</h1>
        <p className="text-xl mt-2">Professional platform platform built with Alex AI</p>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="prose max-w-none">
          <h2>About</h2>
          <p>This page was generated from your dashboard project configuration.</p>
          <p>Business Type: platform</p>
          <p>Theme: gradient</p>
        </div>
      </main>
      
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <p>&copy; 2025 Project test-project-001. All rights reserved.</p>
      </footer>
    </div>
  );
}
