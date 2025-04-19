'use client';

import React from 'react';
import DashboardLayout from '../../dashboard-layout';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiPlus } from 'react-icons/fi';

export default function NewPermitPage() {
  return (
    <DashboardLayout title="Create New Permit">
      <div className="mb-6">
        <Link 
          href="/permits" 
          className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Permits
        </Link>
        
        <h1 className="text-2xl font-semibold">Create New Permit</h1>
        <p className="text-gray-500 mt-1">Fill out the permit details below</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="permitTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Permit Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="permitTitle"
                name="permitTitle"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter permit title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <select
                  id="clientId"
                  name="clientId"
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select client</option>
                  <option value="1">Bank of America</option>
                  <option value="2">Wells Fargo</option>
                  <option value="3">First National Bank</option>
                  <option value="4">Chase Bank</option>
                </select>
                <Link 
                  href="/clients/new"
                  className="flex items-center justify-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100"
                >
                  <FiPlus size={18} />
                </Link>
              </div>
            </div>
            
            <div>
              <label htmlFor="permitType" className="block text-sm font-medium text-gray-700 mb-1">
                Permit Type <span className="text-red-500">*</span>
              </label>
              <select
                id="permitType"
                name="permitType"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select type</option>
                <option value="construction">Construction</option>
                <option value="renovation">Renovation</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="mechanical">Mechanical</option>
                <option value="demolition">Demolition</option>
                <option value="signage">Signage</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="in-progress">In Progress</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Project location"
                required
              />
            </div>
            
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <input
                type="text"
                id="assignedTo"
                name="assignedTo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Person responsible for this permit"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Detailed description of the permit"
              required
            ></textarea>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Checklist Items</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="checkItem1"
                  name="checklistItems"
                  value="Application form completed"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="checkItem1" className="ml-3 block text-sm font-medium text-gray-700">
                  Application form completed
                </label>
              </div>
              
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="checkItem2"
                  name="checklistItems"
                  value="Payment processed"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="checkItem2" className="ml-3 block text-sm font-medium text-gray-700">
                  Payment processed
                </label>
              </div>
              
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="checkItem3"
                  name="checklistItems"
                  value="Site plans submitted"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="checkItem3" className="ml-3 block text-sm font-medium text-gray-700">
                  Site plans submitted
                </label>
              </div>
            </div>
            
            <div className="flex items-center mb-6">
              <input
                type="text"
                id="newChecklistItem"
                name="newChecklistItem"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add new checklist item..."
              />
              <button
                type="button"
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700"
              >
                <FiPlus />
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Link 
              href="/permits" 
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary flex items-center"
            >
              <FiSave className="mr-2" /> Create Permit
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
} 