'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Permit, ChecklistItem, PermitStatus } from './types';
import { 
  sampleClients, 
  samplePermits, 
  sampleChecklistItems, 
  generateId, 
  getTodayFormatted, 
  getDateMonthsFromNow,
  generatePermitNumber,
  calculateProgress
} from './data';

// Define the context shape
interface AppContextType {
  // Data
  clients: Client[];
  permits: Permit[];
  checklistItems: ChecklistItem[];
  
  // Client operations
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => string;
  updateClient: (id: string, clientData: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  getClientPermits: (clientId: string) => Permit[];
  
  // Permit operations
  addPermit: (permit: Omit<Permit, 'id' | 'createdAt' | 'progress' | 'permitNumber'>) => string;
  updatePermit: (id: string, permitData: Partial<Permit>) => void;
  deletePermit: (id: string) => void;
  getPermitById: (id: string) => Permit | undefined;
  getPermitClient: (permitId: string) => Client | undefined;
  
  // Checklist operations
  addChecklistItem: (item: Omit<ChecklistItem, 'id' | 'createdAt'>) => string;
  updateChecklistItem: (id: string, data: Partial<ChecklistItem>) => void;
  deleteChecklistItem: (id: string) => void;
  getPermitChecklistItems: (permitId: string) => ChecklistItem[];
  getChecklistProgress: (permitId: string) => number;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Context provider component
export function AppProvider({ children }: { children: ReactNode }) {
  // Load data from localStorage or use sample data
  const [clients, setClients] = useState<Client[]>(() => {
    if (typeof window !== 'undefined') {
      const storedClients = localStorage.getItem('clients');
      return storedClients ? JSON.parse(storedClients) : sampleClients;
    }
    return sampleClients;
  });
  
  const [permits, setPermits] = useState<Permit[]>(() => {
    if (typeof window !== 'undefined') {
      const storedPermits = localStorage.getItem('permits');
      return storedPermits ? JSON.parse(storedPermits) : samplePermits;
    }
    return samplePermits;
  });
  
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(() => {
    if (typeof window !== 'undefined') {
      const storedChecklistItems = localStorage.getItem('checklistItems');
      return storedChecklistItems ? JSON.parse(storedChecklistItems) : sampleChecklistItems;
    }
    return sampleChecklistItems;
  });

  // Save data to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('clients', JSON.stringify(clients));
      localStorage.setItem('permits', JSON.stringify(permits));
      localStorage.setItem('checklistItems', JSON.stringify(checklistItems));
    }
  }, [clients, permits, checklistItems]);

  // Client operations
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newClient: Client = {
      ...clientData,
      id,
      createdAt: getTodayFormatted(),
    };
    setClients([...clients, newClient]);
    return id;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients(prevClients =>
      prevClients.map(client =>
        client.id === id ? { ...client, ...clientData } : client
      )
    );
  };

  const deleteClient = (id: string) => {
    // First check if client has permits
    const clientPermits = permits.filter(permit => permit.clientId === id);
    if (clientPermits.length > 0) {
      throw new Error("Cannot delete client with associated permits");
    }
    
    setClients(prevClients => prevClients.filter(client => client.id !== id));
  };

  const getClientById = (id: string) => {
    return clients.find(client => client.id === id);
  };

  const getClientPermits = (clientId: string) => {
    return permits.filter(permit => permit.clientId === clientId);
  };

  // Permit operations
  const addPermit = (permitData: Omit<Permit, 'id' | 'createdAt' | 'progress' | 'permitNumber'>) => {
    const id = generateId();
    const permitNumber = generatePermitNumber();
    const newPermit: Permit = {
      ...permitData,
      id,
      createdAt: getTodayFormatted(),
      progress: 0,
      permitNumber,
    };
    setPermits([...permits, newPermit]);
    return id;
  };

  const updatePermit = (id: string, permitData: Partial<Permit>) => {
    setPermits(prevPermits =>
      prevPermits.map(permit =>
        permit.id === id ? { ...permit, ...permitData } : permit
      )
    );
  };

  const deletePermit = (id: string) => {
    // Also delete associated checklist items
    setChecklistItems(prevItems => 
      prevItems.filter(item => item.permitId !== id)
    );
    
    setPermits(prevPermits => 
      prevPermits.filter(permit => permit.id !== id)
    );
  };

  const getPermitById = (id: string) => {
    return permits.find(permit => permit.id === id);
  };

  const getPermitClient = (permitId: string) => {
    const permit = permits.find(p => p.id === permitId);
    if (!permit) return undefined;
    return clients.find(client => client.id === permit.clientId);
  };

  // Checklist operations
  const addChecklistItem = (itemData: Omit<ChecklistItem, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newItem: ChecklistItem = {
      ...itemData,
      id,
      createdAt: getTodayFormatted(),
    };
    
    setChecklistItems(prevItems => [...prevItems, newItem]);
    
    // Update permit progress
    const permitItems = [...checklistItems, newItem].filter(
      item => item.permitId === itemData.permitId
    );
    const progress = calculateProgress(permitItems);
    
    updatePermit(itemData.permitId, { progress });
    
    return id;
  };

  const updateChecklistItem = (id: string, data: Partial<ChecklistItem>) => {
    let permitId = '';
    
    setChecklistItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          permitId = item.permitId;
          return { ...item, ...data };
        }
        return item;
      })
    );
    
    // Update permit progress if item was updated
    if (permitId) {
      const permitItems = checklistItems.filter(
        item => item.permitId === permitId
      );
      const updatedItems = permitItems.map(item => 
        item.id === id ? { ...item, ...data } : item
      );
      const progress = calculateProgress(updatedItems);
      
      updatePermit(permitId, { progress });
    }
  };

  const deleteChecklistItem = (id: string) => {
    const item = checklistItems.find(item => item.id === id);
    if (!item) return;
    
    const permitId = item.permitId;
    
    setChecklistItems(prevItems => 
      prevItems.filter(item => item.id !== id)
    );
    
    // Update permit progress
    const permitItems = checklistItems.filter(
      i => i.permitId === permitId && i.id !== id
    );
    const progress = calculateProgress(permitItems);
    
    updatePermit(permitId, { progress });
  };

  const getPermitChecklistItems = (permitId: string) => {
    return checklistItems.filter(item => item.permitId === permitId);
  };

  const getChecklistProgress = (permitId: string) => {
    const permitItems = checklistItems.filter(item => item.permitId === permitId);
    return calculateProgress(permitItems);
  };

  return (
    <AppContext.Provider
      value={{
        // Data
        clients,
        permits,
        checklistItems,
        
        // Client operations
        addClient,
        updateClient,
        deleteClient,
        getClientById,
        getClientPermits,
        
        // Permit operations
        addPermit,
        updatePermit,
        deletePermit,
        getPermitById,
        getPermitClient,
        
        // Checklist operations
        addChecklistItem,
        updateChecklistItem,
        deleteChecklistItem,
        getPermitChecklistItems,
        getChecklistProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 