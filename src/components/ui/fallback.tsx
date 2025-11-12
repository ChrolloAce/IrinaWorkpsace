'use client';

import React from 'react';

// Basic fallback components in case Tremor components fail to load
export const Button = ({ 
  children, 
  onClick, 
  className = '',
  color = 'default',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  ...props 
}: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded font-medium ${
      color === 'green' ? 'bg-green-500 text-white' :
      color === 'red' ? 'bg-red-500 text-white' :
      color === 'blue' ? 'bg-blue-500 text-white' :
      color === 'purple' ? 'bg-purple-500 text-white' :
      'bg-gray-200 text-gray-800'
    } ${
      variant === 'secondary' ? 'bg-opacity-10 border border-current' :
      variant === 'light' ? 'bg-opacity-0 text-current hover:bg-opacity-10' :
      ''
    } ${
      size === 'xs' ? 'text-xs px-2 py-1' :
      size === 'sm' ? 'text-sm px-3 py-1.5' :
      size === 'lg' ? 'text-lg px-5 py-2.5' :
      ''
    } ${className}`}
    {...props}
  >
    <span className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </span>
  </button>
);

export const Card = ({ 
  children, 
  className = '', 
  ...props 
}: any) => (
  <div
    className={`bg-white border rounded-lg shadow-sm p-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const Text = ({ 
  children, 
  className = '', 
  ...props 
}: any) => (
  <p className={`text-gray-600 ${className}`} {...props}>
    {children}
  </p>
);

export const Title = ({ 
  children, 
  className = '', 
  ...props 
}: any) => (
  <h2 className={`text-xl font-bold ${className}`} {...props}>
    {children}
  </h2>
);

export const Flex = ({ 
  children, 
  className = '', 
  justifyContent = 'start',
  alignItems = 'start',
  ...props 
}: any) => (
  <div
    className={`flex ${
      justifyContent === 'between' ? 'justify-between' :
      justifyContent === 'center' ? 'justify-center' :
      justifyContent === 'end' ? 'justify-end' :
      justifyContent === 'around' ? 'justify-around' :
      justifyContent === 'evenly' ? 'justify-evenly' :
      'justify-start'
    } ${
      alignItems === 'center' ? 'items-center' :
      alignItems === 'end' ? 'items-end' :
      alignItems === 'baseline' ? 'items-baseline' :
      alignItems === 'stretch' ? 'items-stretch' :
      'items-start'
    } ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const Badge = ({ 
  children, 
  className = '', 
  color = 'default',
  size = 'md',
  ...props 
}: any) => (
  <span
    className={`inline-flex items-center rounded-full ${
      color === 'green' ? 'bg-green-100 text-green-800' :
      color === 'red' ? 'bg-red-100 text-red-800' :
      color === 'blue' ? 'bg-blue-100 text-blue-800' :
      color === 'purple' ? 'bg-purple-100 text-purple-800' :
      color === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
      'bg-gray-100 text-gray-800'
    } ${
      size === 'sm' ? 'text-xs px-2 py-0.5' :
      size === 'lg' ? 'text-sm px-3 py-1' :
      'text-xs px-2.5 py-0.5'
    } ${className}`}
    {...props}
  >
    {children}
  </span>
);

// Simplified fallback forms
export const TextInput = ({ 
  value, 
  onChange, 
  placeholder, 
  className = '', 
  type = 'text',
  icon: Icon,
  prefix,
  ...props 
}: any) => (
  <div className="relative">
    {Icon && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
    )}
    {prefix && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-500">{prefix}</span>
      </div>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
        Icon ? 'pl-10' : prefix ? 'pl-7' : ''
      } ${className}`}
      {...props}
    />
  </div>
);

// More fallback components as needed
export const Divider = ({ className = '', ...props }: any) => (
  <hr className={`border-t border-gray-200 my-4 ${className}`} {...props} />
);

// Add more fallback components as needed for your application 