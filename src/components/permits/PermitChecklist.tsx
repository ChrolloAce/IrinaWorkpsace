'use client';

import React, { useState } from 'react';
import { FiSquare, FiCheckSquare, FiPlus, FiTrash, FiDollarSign } from 'react-icons/fi';

type ChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
  price?: number;
};

type PermitChecklistProps = {
  items: ChecklistItem[];
  onItemToggle: (id: string, completed: boolean) => void;
  onAddItem?: (item: Omit<ChecklistItem, 'id'>) => void;
  onDeleteItem?: (id: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
  onUpdatePrice?: (id: string, price: number) => void;
  readOnly?: boolean;
  showPrices?: boolean;
};

export default function PermitChecklist({
  items,
  onItemToggle,
  onAddItem,
  onDeleteItem,
  onUpdateNotes,
  onUpdatePrice,
  readOnly = false,
  showPrices = false
}: PermitChecklistProps) {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemPrice, setNewItemPrice] = useState<string>('');

  const handleAddItem = () => {
    if (newItemTitle.trim() && onAddItem) {
      onAddItem({
        title: newItemTitle.trim(),
        completed: false,
        price: newItemPrice ? parseFloat(newItemPrice) : undefined,
      });
      setNewItemTitle('');
      setNewItemPrice('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handlePriceChange = (id: string, value: string) => {
    if (onUpdatePrice) {
      const numericValue = value === '' ? 0 : parseFloat(value);
      if (!isNaN(numericValue)) {
        onUpdatePrice(id, numericValue);
      }
    }
  };

  const completedCount = items.filter(item => item.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
  
  // Calculate total price of all items
  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);
  
  // Calculate price of completed items
  const completedPrice = items
    .filter(item => item.completed)
    .reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Permit Checklist</h3>
        <div className="text-sm text-gray-500">
          {completedCount} of {items.length} completed
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {showPrices && (
        <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-gray-500">Total Cost: </span>
            <span className="font-medium">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-gray-500">Completed: </span>
            <span className="font-medium">${completedPrice.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-4 max-h-[500px] overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <button 
              className="mt-0.5 mr-3 text-gray-500 hover:text-indigo-600"
              onClick={() => onItemToggle(item.id, !item.completed)}
              disabled={readOnly}
            >
              {item.completed ? (
                <FiCheckSquare className="h-5 w-5 text-indigo-600" />
              ) : (
                <FiSquare className="h-5 w-5" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className={`font-medium truncate mr-2 ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {item.title}
                </p>
                {showPrices && (
                  <div className="flex items-center flex-shrink-0">
                    <FiDollarSign className="h-4 w-4 text-gray-400 mr-1" />
                    {!readOnly && onUpdatePrice ? (
                      <input
                        type="number"
                        className="w-20 p-1 text-sm border border-gray-200 rounded-md"
                        value={item.price || ''}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    ) : (
                      <span className="text-sm font-medium">${(item.price || 0).toFixed(2)}</span>
                    )}
                  </div>
                )}
              </div>
              {onUpdateNotes && (
                <textarea
                  className="mt-2 w-full p-2 text-sm border border-gray-200 rounded-md"
                  placeholder="Add notes..."
                  value={item.notes || ''}
                  onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                  disabled={readOnly}
                  rows={2}
                />
              )}
            </div>
            {onDeleteItem && !readOnly && (
              <button 
                className="ml-2 text-gray-400 hover:text-red-600 flex-shrink-0"
                onClick={() => onDeleteItem(item.id)}
              >
                <FiTrash className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {onAddItem && !readOnly && (
        <div className="mt-auto">
          <div className="flex items-center mb-2">
            <input
              type="text"
              className="flex-1 border border-gray-200 rounded-l-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Add new checklist item..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 text-sm"
              onClick={handleAddItem}
            >
              <FiPlus className="h-4 w-4" />
            </button>
          </div>
          {showPrices && (
            <div className="flex items-center">
              <div className="flex items-center w-full border border-gray-200 rounded-lg py-2 px-4 text-sm">
                <FiDollarSign className="h-4 w-4 text-gray-400 mr-1" />
                <input
                  type="number"
                  className="w-full focus:outline-none"
                  placeholder="Item price (optional)"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 