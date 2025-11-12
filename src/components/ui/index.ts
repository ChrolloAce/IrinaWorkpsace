'use client';

import React from 'react';
import * as Fallback from './fallback';

// Export UI components
export { useToast, ToastProvider } from './toast';

// Try to import Tremor components, use fallbacks if they fail
let Button: any, Card: any, Text: any, Title: any, Flex: any, Grid: any, Col: any, 
    Badge: any, Divider: any, TextInput: any, Select: any, SelectItem: any, 
    Textarea: any, Table: any, TableHead: any, TableHeaderCell: any, 
    TableBody: any, TableRow: any, TableCell: any;

try {
  // Try to import Tremor components
  const tremor = require('@tremor/react');
  
  Button = tremor.Button;
  Card = tremor.Card;
  Text = tremor.Text;
  Title = tremor.Title;
  Flex = tremor.Flex;
  Grid = tremor.Grid;
  Col = tremor.Col;
  Badge = tremor.Badge;
  Divider = tremor.Divider;
  TextInput = tremor.TextInput;
  Select = tremor.Select;
  SelectItem = tremor.SelectItem;
  Textarea = tremor.Textarea;
  Table = tremor.Table;
  TableHead = tremor.TableHead;
  TableHeaderCell = tremor.TableHeaderCell;
  TableBody = tremor.TableBody;
  TableRow = tremor.TableRow;
  TableCell = tremor.TableCell;
  
  console.log('Successfully loaded Tremor components');
} catch (error) {
  console.error('Failed to load Tremor components, using fallbacks', error);
  
  // Use fallback components
  Button = Fallback.Button;
  Card = Fallback.Card;
  Text = Fallback.Text;
  Title = Fallback.Title;
  Flex = Fallback.Flex;
  Badge = Fallback.Badge;
  Divider = Fallback.Divider;
  TextInput = Fallback.TextInput;
  
  // Minimal fallbacks for the rest
  Grid = ({ children, className = '', ...props }: any) => (
    <div className={`grid ${className}`} {...props}>{children}</div>
  );
  Col = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  Select = ({ children, value, onValueChange, ...props }: any) => (
    <select 
      value={value} 
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onValueChange?.(e.target.value)}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      {...props}
    >
      {children}
    </select>
  );
  SelectItem = ({ children, value, ...props }: any) => (
    <option value={value} {...props}>{children}</option>
  );
  Textarea = ({ value, onChange, rows = 3, ...props }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      {...props}
    />
  );
  Table = ({ children, ...props }: any) => <table className="min-w-full divide-y divide-gray-200" {...props}>{children}</table>;
  TableHead = ({ children, ...props }: any) => <thead {...props}>{children}</thead>;
  TableHeaderCell = ({ children, ...props }: any) => <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props}>{children}</th>;
  TableBody = ({ children, ...props }: any) => <tbody className="bg-white divide-y divide-gray-200" {...props}>{children}</tbody>;
  TableRow = ({ children, ...props }: any) => <tr {...props}>{children}</tr>;
  TableCell = ({ children, ...props }: any) => <td className="px-6 py-4 whitespace-nowrap" {...props}>{children}</td>;
}

// Export everything
export {
  Button,
  Card,
  Text,
  Title,
  Flex,
  Grid,
  Col,
  Badge,
  Divider,
  TextInput,
  Select,
  SelectItem,
  Textarea,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell
}; 