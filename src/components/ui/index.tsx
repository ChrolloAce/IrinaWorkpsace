'use client';

import React from 'react';
import * as Fallback from './fallback';
import { useToast, ToastProvider } from './toast';

// Import and re-export toast components
export { useToast, ToastProvider };

// Try to import Tremor components
let tremorimports: any = {};

try {
  tremorimports = require('@tremor/react');
  console.log('Successfully loaded Tremor components');
} catch (error) {
  console.error('Failed to load Tremor components, using fallbacks', error);
}

// Define with fallbacks
export const Button = tremorimports.Button || Fallback.Button;
export const Card = tremorimports.Card || Fallback.Card;
export const Text = tremorimports.Text || Fallback.Text;
export const Title = tremorimports.Title || Fallback.Title;
export const Flex = tremorimports.Flex || Fallback.Flex;
export const Badge = tremorimports.Badge || Fallback.Badge;
export const Divider = tremorimports.Divider || Fallback.Divider;
export const TextInput = tremorimports.TextInput || Fallback.TextInput;

// Some components might not have fallbacks
export const Grid = tremorimports.Grid || (({ children, className = '', ...props }: any) => (
  <div className={`grid ${className}`} {...props}>{children}</div>
));

export const Col = tremorimports.Col || (({ children, ...props }: any) => (
  <div {...props}>{children}</div>
));

export const Select = tremorimports.Select || (({ children, value, onValueChange, ...props }: any) => (
  <select 
    value={value} 
    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onValueChange?.(e.target.value)}
    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
    {...props}
  >
    {children}
  </select>
));

export const SelectItem = tremorimports.SelectItem || (({ children, value, ...props }: any) => (
  <option value={value} {...props}>{children}</option>
));

export const Textarea = tremorimports.Textarea || (({ value, onChange, rows = 3, ...props }: any) => (
  <textarea
    value={value}
    onChange={onChange}
    rows={rows}
    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
    {...props}
  />
));

export const Table = tremorimports.Table || (({ children, ...props }: any) => (
  <table className="min-w-full divide-y divide-gray-200" {...props}>{children}</table>
));

export const TableHead = tremorimports.TableHead || (({ children, ...props }: any) => (
  <thead {...props}>{children}</thead>
));

export const TableHeaderCell = tremorimports.TableHeaderCell || (({ children, ...props }: any) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props}>{children}</th>
));

export const TableBody = tremorimports.TableBody || (({ children, ...props }: any) => (
  <tbody className="bg-white divide-y divide-gray-200" {...props}>{children}</tbody>
));

export const TableRow = tremorimports.TableRow || (({ children, ...props }: any) => (
  <tr {...props}>{children}</tr>
));

export const TableCell = tremorimports.TableCell || (({ children, ...props }: any) => (
  <td className="px-6 py-4 whitespace-nowrap" {...props}>{children}</td>
)); 