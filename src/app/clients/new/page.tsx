'use client';

import React from 'react';
import DashboardLayout from '../../dashboard-layout';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function NewClientPage() {
  return (
    <DashboardLayout title="Add New Client">
      <div className="mb-6">
        <Link 
          href="/clients" 
          className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4"
        >
          <FiArrowLeft className="mr-2" /> Back to Clients
        </Link>
        
        <h1 className="text-2xl font-semibold">Add New Client</h1>
        <p className="text-gray-500 mt-1">Enter client information below</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter client/company name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Primary contact name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="email@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="(123) 456-7890"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Street address"
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="City"
                required
              />
            </div>
            
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="state"
                name="state"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select state</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                {/* Add more states as needed */}
              </select>
            </div>
            
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="ZIP Code"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any additional information about this client"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Link 
              href="/clients" 
              className="btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary flex items-center"
            >
              <FiSave className="mr-2" /> Save Client
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
} 