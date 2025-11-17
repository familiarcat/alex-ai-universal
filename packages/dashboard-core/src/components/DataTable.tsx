/**
 * Data Table Component
 * 
 * Reusable table component for displaying structured data
 * Supports editing, sorting, filtering, and theming
 */

import React, { useState } from 'react';
import { BaseCard, BaseCardProps } from './BaseCard';
import { DashboardComponent, DashboardTheme } from '../types';

export interface DataTableProps extends Omit<BaseCardProps, 'component' | 'children'> {
  component: DashboardComponent;
  data?: any[];
  columns?: Array<{
    key: string;
    label: string;
    editable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

export function DataTable({
  component,
  theme,
  data = [],
  columns = [],
  editable = false,
  sortable = true,
  filterable = true,
  onEdit,
  onDelete,
  className = ''
}: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<string>('');

  // Extract columns from data if not provided
  const tableColumns = columns.length > 0 
    ? columns 
    : data.length > 0 
      ? Object.keys(data[0]).map(key => ({ key, label: key }))
      : [];

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Filter data
  const filteredData = filter
    ? sortedData.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(filter.toLowerCase())
        )
      )
    : sortedData;

  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  return (
    <BaseCard
      component={component}
      theme={theme}
      editable={editable}
      onEdit={onEdit}
      onDelete={onDelete}
      className={className}
    >
      {filterable && (
        <input
          type="text"
          placeholder="Filter data..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            marginBottom: '12px',
            padding: '8px',
            width: '100%',
            border: `1px solid ${theme?.colors.border || '#e0e0e0'}`,
            borderRadius: '4px'
          }}
        />
      )}
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: theme?.typography?.fontSize?.base || '14px'
        }}>
          <thead>
            <tr style={{
              backgroundColor: theme?.colors.background || '#f5f5f5',
              borderBottom: `2px solid ${theme?.colors.border || '#e0e0e0'}`
            }}>
              {tableColumns.map(column => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    cursor: sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    color: theme?.colors.text || '#000000'
                  }}
                >
                  {column.label}
                  {sortable && sortColumn === column.key && (
                    <span style={{ marginLeft: '4px' }}>
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: `1px solid ${theme?.colors.border || '#e0e0e0'}`
                }}
              >
                {tableColumns.map(column => (
                  <td
                    key={column.key}
                    style={{
                      padding: '12px',
                      color: theme?.colors.text || '#000000'
                    }}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredData.length === 0 && (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: theme?.colors.textMuted || '#666666'
        }}>
          No data available
        </div>
      )}
    </BaseCard>
  );
}

