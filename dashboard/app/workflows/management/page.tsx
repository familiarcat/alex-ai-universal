'use client';

/**
 * Workflow Management Page
 * 
 * Dashboard for managing all workflows
 */

import dynamic from 'next/dynamic';

const WorkflowManagement = dynamic(() => import('@/components/workflows/WorkflowManagement'), {
  ssr: false
});

export default function WorkflowManagementPage() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: 'var(--spacing-lg)',
      background: 'var(--background)'
    }}>
      <WorkflowManagement />
    </div>
  );
}

